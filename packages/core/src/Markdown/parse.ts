/** One inline run produced by the restricted Markdown parser. */
export type InlineNode =
  | {readonly kind: 'code'; readonly text: string}
  | {readonly kind: 'emphasis'; readonly text: string}
  | {readonly kind: 'link'; readonly href: string; readonly text: string}
  | {readonly kind: 'strong'; readonly text: string}
  | {readonly kind: 'text'; readonly text: string};

/** One block produced by the restricted Markdown parser. */
export type BlockNode =
  | {
      readonly kind: 'heading';
      readonly level: 2 | 3;
      readonly spans: readonly InlineNode[];
    }
  | {
      readonly kind: 'list';
      readonly items: readonly (readonly InlineNode[])[];
      readonly ordered: boolean;
    }
  | {readonly kind: 'paragraph'; readonly spans: readonly InlineNode[]}
  | {readonly kind: 'quote'; readonly spans: readonly InlineNode[]};

// Ordered so the first match wins; `strong` must precede `emphasis`.
const inlinePattern =
  /(`[^`]+`)|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/u;

// Only http(s) and root-relative targets survive; everything else is inert
// text, which is what stops `javascript:` from reaching an anchor.
function safeHref(href: string) {
  return /^(https?:\/\/|\/)/u.test(href) ? href : undefined;
}

/** Splits one line into inline runs. */
export function parseInline(line: string): readonly InlineNode[] {
  const spans: InlineNode[] = [];
  let rest = line;

  while (rest !== '') {
    const match = inlinePattern.exec(rest);
    if (!match || match.index === undefined) {
      spans.push({kind: 'text', text: rest});
      break;
    }

    if (match.index > 0) {
      spans.push({kind: 'text', text: rest.slice(0, match.index)});
    }

    const token = match[0];
    if (token.startsWith('`')) {
      spans.push({kind: 'code', text: token.slice(1, -1)});
    } else if (token.startsWith('[')) {
      const divider = token.indexOf('](');
      const text = token.slice(1, divider);
      const href = safeHref(token.slice(divider + 2, -1));
      spans.push(
        href === undefined ? {kind: 'text', text} : {href, kind: 'link', text},
      );
    } else if (token.startsWith('**')) {
      spans.push({kind: 'strong', text: token.slice(2, -2)});
    } else {
      spans.push({kind: 'emphasis', text: token.slice(1, -1)});
    }

    rest = rest.slice(match.index + token.length);
  }

  return spans;
}

/**
 * Parses a deliberately small Markdown subset: paragraphs, `##`/`###`
 * headings, `-`/`1.` lists, `>` quotes, and inline code, emphasis, strong,
 * and links. Raw HTML is never interpreted, so untrusted text stays inert.
 */
export function parseMarkdown(source: string): readonly BlockNode[] {
  const blocks: BlockNode[] = [];
  const lines = source.replace(/\r\n/gu, '\n').split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (line.trim() === '') {
      index += 1;
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/u.exec(line);
    if (heading) {
      blocks.push({
        kind: 'heading',
        level: heading[1]?.length === 2 ? 2 : 3,
        spans: parseInline(heading[2] ?? ''),
      });
      index += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      blocks.push({kind: 'quote', spans: parseInline(line.slice(2))});
      index += 1;
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/u.exec(line);
    const numbered = /^\d+\.\s+(.*)$/u.exec(line);
    if (bullet || numbered) {
      const ordered = numbered !== null;
      const items: (readonly InlineNode[])[] = [];

      while (index < lines.length) {
        const entry = ordered
          ? /^\d+\.\s+(.*)$/u.exec(lines[index] ?? '')
          : /^[-*]\s+(.*)$/u.exec(lines[index] ?? '');
        if (!entry) break;
        items.push(parseInline(entry[1] ?? ''));
        index += 1;
      }

      blocks.push({items, kind: 'list', ordered});
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && (lines[index] ?? '').trim() !== '') {
      paragraph.push(lines[index] ?? '');
      index += 1;
    }
    blocks.push({kind: 'paragraph', spans: parseInline(paragraph.join(' '))});
  }

  return blocks;
}
