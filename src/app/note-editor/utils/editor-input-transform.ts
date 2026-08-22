import { TextState } from "../../shared/utils/text-state";

function removePrefixAt(text: string, startIndex: number, prefix: string): string {
  if (startIndex < text.length && text.slice(startIndex).startsWith(prefix)) {
    return text.slice(0, startIndex) + text.slice(startIndex + prefix.length);
  }
  return text;
}

function removeRegexPrefixAt(text: string, startIndex: number, regex: RegExp): string {
  const match = regex.exec(text.slice(startIndex));
  if (match && match.index === 0) {
    return text.slice(0, startIndex) + text.slice(startIndex + match[0].length);
  }
  return text;
}

function insertAfterCursor(text: string, cursor: number, insertion: string): TextState {
  const updated = text.slice(0, cursor) + insertion + text.slice(cursor);
  return { text: updated, cursor: cursor + insertion.length };
}

/**
 * Ported from Lichen's transformEditorInput: auto-continues bullet/checklist/numbered
 * lines on Enter, and collapses an empty list marker back to plain text on Backspace.
 * oldState/newState are the textarea's value+caret before and after the native edit.
 */
export function transformEditorInput(oldState: TextState, newState: TextState): TextState {
  const oldText = oldState.text;
  const newText = newState.text;
  const cursor = Math.min(Math.max(newState.cursor, 0), newText.length);

  const insertedNewline =
    newText.length > oldText.length && cursor > 0 && newText[cursor - 1] === '\n';

  if (insertedNewline) {
    const searchFrom = Math.max(cursor - 2, 0);
    const nlBefore = newText.lastIndexOf('\n', searchFrom);
    const prevLineStart = nlBefore === -1 ? 0 : nlBefore + 1;
    const prevLineEnd = Math.max(cursor - 1, prevLineStart);
    const prevLine = prevLineStart <= prevLineEnd ? newText.slice(prevLineStart, prevLineEnd) : '';

    const indent = prevLine.match(/^ */)?.[0] ?? '';
    const trimmed = prevLine.trimStart();

    // Exit empty list items instead of continuing them
    if (trimmed === '- ' || trimmed === '- [ ] ' || trimmed === '- [x] ' || /^\d+\.\s$/.test(trimmed)) {
      return newState;
    }

    if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
      return insertAfterCursor(newText, cursor, `${indent}- [ ] `);
    }

    if (trimmed.startsWith('- ')) {
      return insertAfterCursor(newText, cursor, `${indent}- `);
    }

    const numberMatch = /^(\d+)\.\s/.exec(trimmed);
    if (numberMatch) {
      const next = (parseInt(numberMatch[1], 10) || 1) + 1;
      return insertAfterCursor(newText, cursor, `${indent}${next}. `);
    }
  }

  const didDelete = newText.length < oldText.length;
  if (didDelete) {
    const nlBefore = newText.lastIndexOf('\n', Math.max(cursor - 1, 0));
    const lineStart = nlBefore === -1 ? 0 : nlBefore + 1;
    const beforeCursor = lineStart <= cursor ? newText.slice(lineStart, cursor) : '';
    const trimmed = beforeCursor.trimStart();

    if (trimmed === '-' || trimmed === '') {
      let updated = removePrefixAt(newText, lineStart, '- [ ] ');
      updated = removePrefixAt(updated, lineStart, '- [x] ');
      updated = removePrefixAt(updated, lineStart, '- ');
      updated = removeRegexPrefixAt(updated, lineStart, /^\d+\.\s/);
      return { text: updated, cursor: lineStart };
    }
  }

  return newState;
}
