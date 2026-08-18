import * as stylex from '@stylexjs/stylex';
import {Fragment, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Blockquote} from '../Blockquote/index.js';
import {Code} from '../Code/index.js';
import {Heading} from '../Heading/index.js';
import {List, ListItem} from '../List/index.js';
import {Link} from '../navigation/index.js';
import {Text} from '../Text/index.js';
import {parseMarkdown, type InlineNode} from './parse.js';

const styles = stylex.create({
  prose: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
  },
});

function renderInline(spans: readonly InlineNode[]) {
  return spans.map((span, index) => {
    switch (span.kind) {
      case 'code':
        return <Code key={index}>{span.text}</Code>;
      case 'emphasis':
        return <em key={index}>{span.text}</em>;
      case 'link':
        return (
          <Link href={span.href} key={index}>
            {span.text}
          </Link>
        );
      case 'strong':
        return <strong key={index}>{span.text}</strong>;
      default:
        return <Fragment key={index}>{span.text}</Fragment>;
    }
  });
}

/** Props for rendering a restricted Markdown subset. */
export interface MarkdownProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'dangerouslySetInnerHTML'
> {
  readonly source: string;
}

/**
 * Renders a deliberately small Markdown subset into system components. Raw
 * HTML is never interpreted and only http(s) or root-relative links survive,
 * so text from an untrusted source cannot inject markup or a script URL.
 */
export function Markdown({source, ...props}: MarkdownProps) {
  const blocks = parseMarkdown(source);

  return (
    <div {...props} {...stylex.props(styles.prose)}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <Heading
                key={index}
                level={block.level}
                size={block.level === 2 ? 'section' : 'subsection'}
              >
                {renderInline(block.spans)}
              </Heading>
            );
          case 'list':
            return (
              <List
                key={index}
                variant={block.ordered ? 'ordered' : 'unordered'}
              >
                {block.items.map((item, itemIndex) => (
                  <ListItem key={itemIndex}>{renderInline(item)}</ListItem>
                ))}
              </List>
            );
          case 'quote':
            return (
              <Blockquote key={index}>{renderInline(block.spans)}</Blockquote>
            );
          default:
            return <Text key={index}>{renderInline(block.spans)}</Text>;
        }
      })}
    </div>
  );
}
