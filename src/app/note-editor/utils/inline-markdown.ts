export interface InlineSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

/** Parses **bold**, *italic*, and `code` spans out of a line of text. */
export function renderInlineMarkdown(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  let i = 0;

  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        spans.push({ text: text.slice(i + 2, end), bold: true });
        i = end + 2;
        continue;
      }
    }
    if (text.startsWith('*', i)) {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        spans.push({ text: text.slice(i + 1, end), italic: true });
        i = end + 1;
        continue;
      }
    }
    if (text.startsWith('`', i)) {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        spans.push({ text: ` ${text.slice(i + 1, end)} `, code: true });
        i = end + 1;
        continue;
      }
    }
    // Append to the previous plain span, or start a new one
    const last = spans[spans.length - 1];
    if (last && !last.bold && !last.italic && !last.code) {
      last.text += text[i];
    } else {
      spans.push({ text: text[i] });
    }
    i++;
  }

  return spans;
}
