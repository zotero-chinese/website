import { ofetch } from 'ofetch'

async function fetchGiteeDate(downloadUrl, fetchJson) {
  const { pathname } = new URL(downloadUrl)
  const match = pathname.match(/^\/([^/]+)\/([^/]+)\/raw\/([^/]+)\/(.+)$/)
  if (!match) throw new Error(`Unsupported Gitee download URL: ${downloadUrl}`)

  const [, owner, repo, ref, file] = match
  const query = new URLSearchParams({
    sha: decodeURIComponent(ref),
    path: decodeURIComponent(file),
    per_page: '1',
  })
  const commits = await fetchJson(
    `https://gitee.com/api/v5/repos/${owner}/${repo}/commits?${query}`,
  )
  const date = commits[0]?.commit?.committer?.date
  if (!date || !Number.isFinite(Date.parse(date))) {
    throw new Error(`No valid Gitee file update date: ${downloadUrl}`)
  }
  return new Date(date).toISOString()
}

// Upstream may pair a Gitee XPI with the date of an unrelated GitHub release.
// Resolve dates before changing the snapshot so a failed request cannot leave a partial update.
export async function refreshGiteeReleaseDates(
  plugins,
  fetchJson = (url) => ofetch(url, { timeout: 15000, retry: 2 }),
) {
  const releases = plugins
    .flatMap((plugin) => plugin.releases)
    .filter((release) => release.xpiDownloadUrl?.github?.startsWith('https://gitee.com/'))
  const urls = [...new Set(releases.map((release) => release.xpiDownloadUrl.github))]
  const dates = new Map(
    await Promise.all(urls.map(async (url) => [url, await fetchGiteeDate(url, fetchJson)])),
  )

  for (const release of releases) {
    release.releaseDate = dates.get(release.xpiDownloadUrl.github)
  }
}
