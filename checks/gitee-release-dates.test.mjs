import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setImmediate as nextTurn } from 'node:timers/promises'
import { refreshGiteeReleaseDates } from '../.github/scripts/gitee-release-dates.mjs'

const awesomeUrl = 'https://gitee.com/MuiseDestiny/plugins/raw/master/zotero-gpt.xpi'
const oldDate = '2026-05-01T22:47:34Z'
const fileCommitDate = '2026-10-07T13:01:26+08:00'
const correctedDate = '2026-10-07T05:01:26.000Z'

// The upstream Awesome GPT record paired a current Gitee XPI with an old GitHub release date.
function awesomeRelease(targetZoteroVersion = '10', downloadUrl = awesomeUrl) {
  return {
    targetZoteroVersion,
    tagName: '3.1.4',
    xpiDownloadUrl: {
      github: downloadUrl,
      ghProxy: `https://gh-proxy.org/${downloadUrl}`,
    },
    releaseDate: oldDate,
    id: 'zoterogpt@polygon.org',
    xpiVersion: '3.1.183',
    name: 'Awesome GPT',
    description: 'Awesome GPT for Zotero',
    minZoteroVersion: '10.0',
    maxZoteroVersion: '10.*',
  }
}

function awesomePlugin(releases) {
  return { repo: 'MuiseDestiny/zotero-gpt', name: 'Awesome GPT', releases }
}

function commits(date) {
  return [{ commit: { committer: { date } } }]
}

test('Awesome GPT 3.1.183 uses its October 7 Gitee file commit, preserving versions and URLs', async () => {
  const release = awesomeRelease()
  const downloadUrls = release.xpiDownloadUrl
  const githubRelease = {
    ...awesomeRelease(
      '9',
      'https://github.com/MuiseDestiny/zotero-gpt/releases/download/2.2.3/zotero-gpt.xpi',
    ),
    tagName: '2.2.3',
    xpiVersion: '3.1.3',
    releaseDate: '2025-10-11T06:46:06Z',
    minZoteroVersion: '6.999',
    maxZoteroVersion: '100.*',
  }
  const plugins = [awesomePlugin([release, githubRelease])]
  const expected = structuredClone(plugins)
  expected[0].releases[0].releaseDate = correctedDate
  const requests = []

  await refreshGiteeReleaseDates(plugins, async (url) => {
    requests.push(new URL(url))
    return [
      {
        sha: '8c5056d981ae83d0f982de40180870ce57db2350',
        commit: {
          author: { date: '2026-10-06T10:00:00+08:00' },
          committer: { date: fileCommitDate },
        },
      },
      ...commits('2026-10-01T10:00:00+08:00'),
    ]
  })

  assert.equal(requests.length, 1)
  assert.equal(requests[0].origin, 'https://gitee.com')
  assert.equal(requests[0].pathname, '/api/v5/repos/MuiseDestiny/plugins/commits')
  assert.deepEqual(Object.fromEntries(requests[0].searchParams), {
    sha: 'master',
    path: 'zotero-gpt.xpi',
    per_page: '1',
  })
  assert.deepEqual(plugins, expected)
  assert.equal(plugins[0].releases[0], release)
  assert.equal(release.xpiDownloadUrl, downloadUrls)
  assert.equal(plugins[0].releases[1], githubRelease)
})

test('non-Gitee downloads keep their dates and require no network calls', async () => {
  const plugins = [
    awesomePlugin([
      awesomeRelease('9', 'https://github.com/owner/plugin/releases/download/v1/plugin.xpi'),
      awesomeRelease('8', 'https://downloads.example.org/plugin.xpi'),
    ]),
  ]
  const before = structuredClone(plugins)
  await refreshGiteeReleaseDates(plugins, async () => {
    assert.fail('Non-Gitee downloads must not request Gitee commit dates')
  })
  assert.deepEqual(plugins, before)
})

test('one Gitee URL shared by multiple Zotero versions is fetched once and updates every release', async () => {
  const plugins = [awesomePlugin(['10', '9', '8'].map((version) => awesomeRelease(version)))]
  let calls = 0
  await refreshGiteeReleaseDates(plugins, async () => {
    calls++
    return commits(fileCommitDate)
  })

  assert.equal(calls, 1)
  assert.deepEqual(
    plugins[0].releases.map(({ targetZoteroVersion, releaseDate }) => ({
      targetZoteroVersion,
      releaseDate,
    })),
    ['10', '9', '8'].map((targetZoteroVersion) => ({
      targetZoteroVersion,
      releaseDate: correctedDate,
    })),
  )
})

test('files and branches within one Gitee repository retain their own update dates', async () => {
  const releases = [
    awesomeRelease(),
    awesomeRelease(
      '9',
      'https://gitee.com/MuiseDestiny/plugins/raw/master/packages/zotero-style.xpi',
    ),
    awesomeRelease('8', 'https://gitee.com/MuiseDestiny/plugins/raw/beta/zotero-gpt.xpi'),
  ]
  const dates = {
    'master:zotero-gpt.xpi': fileCommitDate,
    'master:packages/zotero-style.xpi': '2026-09-28T12:00:00+08:00',
    'beta:zotero-gpt.xpi': '2026-10-08T15:00:00+08:00',
  }
  const requestedFiles = []
  await refreshGiteeReleaseDates([awesomePlugin(releases)], async (url) => {
    const { pathname, searchParams } = new URL(url)
    assert.equal(pathname, '/api/v5/repos/MuiseDestiny/plugins/commits')
    assert.equal(searchParams.get('per_page'), '1')
    const key = `${searchParams.get('sha')}:${searchParams.get('path')}`
    requestedFiles.push(key)
    assert.ok(key in dates, `Unexpected commit query: ${key}`)
    return commits(dates[key])
  })

  assert.deepEqual(requestedFiles.sort(), Object.keys(dates).sort())
  assert.deepEqual(
    releases.map((release) => release.releaseDate),
    [correctedDate, '2026-09-28T04:00:00.000Z', '2026-10-08T07:00:00.000Z'],
  )
})

test('a failed request leaves all input untouched, even after another file date has resolved', async () => {
  const plugins = [
    awesomePlugin([
      awesomeRelease(),
      awesomeRelease('9', 'https://gitee.com/MuiseDestiny/plugins/raw/master/zotero-style.xpi'),
    ]),
  ]
  const before = structuredClone(plugins)
  const pendingRequest = Promise.withResolvers()
  const requestStarted = Promise.withResolvers()
  const refresh = refreshGiteeReleaseDates(plugins, async (url) => {
    if (new URL(url).searchParams.get('path') === 'zotero-gpt.xpi') return commits(fileCommitDate)
    requestStarted.resolve()
    return pendingRequest.promise
  })

  await requestStarted.promise
  await nextTurn()
  assert.deepEqual(plugins, before, 'Do not mutate a snapshot while some dates are still unknown')
  const rejected = assert.rejects(refresh, /Gitee unavailable/)
  pendingRequest.reject(new Error('Gitee unavailable'))
  await rejected
  await nextTurn()
  assert.deepEqual(plugins, before)
})

for (const [label, response] of [
  ['no commits', []],
  ['an invalid date', commits('not-a-date')],
  ['a missing committer date', [{ commit: { committer: {} } }]],
]) {
  test(`${label} rejects without partial updates or fabricated current dates`, async () => {
    const plugins = [
      awesomePlugin([
        awesomeRelease(),
        awesomeRelease('9', 'https://gitee.com/MuiseDestiny/plugins/raw/master/zotero-style.xpi'),
      ]),
    ]
    const before = structuredClone(plugins)
    await assert.rejects(
      refreshGiteeReleaseDates(plugins, async (url) =>
        new URL(url).searchParams.get('path') === 'zotero-gpt.xpi'
          ? commits(fileCommitDate)
          : response,
      ),
    )
    await nextTurn()
    assert.deepEqual(plugins, before)
  })
}
