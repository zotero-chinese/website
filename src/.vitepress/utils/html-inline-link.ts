import type { MarkdownRenderer } from 'vitepress'

/** markdown-it 未公开 `linkLevel` 与 Ruler 的内部字段，这里局部声明 */
interface InlineState {
  linkLevel: number
  tokens: { type: string; content: string }[]
}

interface RulerInternals {
  __find__(name: string): number
  __rules__: { fn: (state: InlineState, silent: boolean) => boolean }[]
}

const isLinkOpen = (str: string) => /^<a[>\s]/i.test(str)
const isLinkClose = (str: string) => /^<\/a\s*>/i.test(str)

/**
 * 恢复 markdown-it 在 `html_inline` 规则中对 `state.linkLevel` 的维护。
 *
 * 原因：VitePress 的 `componentPlugin` 会用自带实现替换 markdown-it 的
 * `html_inline` 规则，而该实现没有像上游那样在遇到 `<a>` / `</a>` 时增删
 * `state.linkLevel`。内联的 `linkify` 规则正是靠 `state.linkLevel > 0` 来避免
 * 在裸 HTML 链接内部再次生成 `<a>`，于是形如
 *
 *     <a href="https://example.com">https://example.com</a>
 *
 * 会被渲染成嵌套的 `<a><a>...</a></a>`，触发 Vue 的
 * “<a> cannot be child of <a>” 警告，并可能导致 hydration 不匹配。
 *
 * 必须在 `linkify` 之后（VitePress 的 `componentPlugin` 之后）调用。
 *
 * @see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/html_inline.mjs
 */
export function restoreHtmlInlineLinkLevel(md: MarkdownRenderer) {
  const ruler = md.inline.ruler as unknown as RulerInternals & {
    at(name: string, fn: (state: InlineState, silent: boolean) => boolean): void
  }
  const index = ruler.__find__('html_inline')
  if (index === -1) return

  const original = ruler.__rules__[index].fn

  ruler.at('html_inline', (state, silent) => {
    const startIndex = state.tokens.length
    const matched = original(state, silent)
    if (!matched || silent) return matched

    // 规则通常只产出一个 token，但按区间遍历以兼容后续变更
    for (let i = startIndex; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.type !== 'html_inline') continue
      if (isLinkOpen(token.content)) state.linkLevel++
      if (isLinkClose(token.content)) state.linkLevel--
    }

    return matched
  })
}
