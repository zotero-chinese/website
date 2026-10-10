import assert from 'node:assert/strict'
import { test } from 'node:test'
import { searchPlugins } from '../src/.vitepress/data/pluginSearch.ts'
import type { PluginInfo } from '../src/.vitepress/data/pluginData.ts'

const jasminum: PluginInfo = {
  repo: 'l0o0/jasminum',
  name: 'Jasminum',
  description: 'Retrieve CNKI metadata',
  author: { name: 'l0o0', url: '', avatar: '' },
  releases: [],
  lastUpdated: '',
  stars: 0,
  tags: ['metadata'],
  recommended: false,
}

test('Chinese wiki titles make existing upstream plugins searchable without local aliases', () => {
  const other = { ...jasminum, repo: 'l0o0/tara', name: 'Tara' }
  const docs = [
    { repo: jasminum.repo, title: '茉莉花', url: '/user-guide/plugins/jasminum' },
    { repo: other.repo, title: '蒲公英', url: '/user-guide/plugins/tara' },
  ]
  assert.deepEqual(searchPlugins([jasminum, other], '茉莉花', docs), [jasminum])
})

test('search accepts trimmed mixed-case words across name, repository and author', () => {
  assert.deepEqual(searchPlugins([jasminum], '  JASMINUM   l0o0  ', []), [jasminum])
  assert.deepEqual(searchPlugins([jasminum], 'Jasminum missing', []), [])
  assert.deepEqual(searchPlugins([jasminum], '   ', []), [jasminum])
})

test('curated metadata augments rather than replaces original searchable text', () => {
  const curated = {
    ...jasminum,
    nameZh: '茉莉花',
    summaryZh: '检索中文文献元数据',
    keywords: ['知网'],
  }
  for (const query of ['茉莉花', '中文文献', '知网 CNKI', 'Jasminum']) {
    assert.deepEqual(searchPlugins([curated], query, []), [curated])
  }
})
