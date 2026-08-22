import { TextState } from "./text-state";
import {
  BlockTextStyle,
  SelectionFormatting,
} from "../../data-access/notes/note-blocks.model";

export interface Selection extends TextState {
  selectionEnd: number; // equals cursor for a collapsed selection
}

/** Wrap the selection in a marker pair, or insert an empty pair at the cursor. */
export function toggleInline(sel: Selection, marker: string): Selection {
  const { text } = sel;
  const start = sel.cursor;
  const end = sel.selectionEnd;

  if (start === end) {
    const newText = text.slice(0, start) + marker + marker + text.slice(start);
    const cursor = start + marker.length;
    return { text: newText, cursor, selectionEnd: cursor };
  }

  const newText =
    text.slice(0, start) +
    marker +
    text.slice(start, end) +
    marker +
    text.slice(end);
  return {
    text: newText,
    cursor: start + marker.length,
    selectionEnd: end + marker.length,
  };
}

type BlockType = "bullet" | "checklist" | "numbered";

function currentLine(
  text: string,
  cursor: number,
): { lineStart: number; lineEnd: number; line: string } {
  const nlBefore = text.lastIndexOf("\n", cursor - 1);
  const lineStart = nlBefore === -1 ? 0 : nlBefore + 1;
  const nlAfter = text.indexOf("\n", lineStart);
  const lineEnd = nlAfter === -1 ? text.length : nlAfter;
  return { lineStart, lineEnd, line: text.slice(lineStart, lineEnd) };
}

/** Toggle the current line between plain / bullet / checklist / numbered. */
export function toggleBlock(sel: Selection, type: BlockType): Selection {
  const { text } = sel;
  const { lineStart, lineEnd, line } = currentLine(text, sel.cursor);
  const indent = line.match(/^ */)?.[0] ?? "";
  const trimmed = line.trimStart();

  const isChecklist =
    trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ");
  const isBullet = trimmed.startsWith("- ") && !isChecklist;
  const isNumbered = /^\d+\.\s/.test(trimmed);

  const cleaned = trimmed
    .replace(/^- \[ \] /, "")
    .replace(/^- \[x\] /, "")
    .replace(/^- /, "")
    .replace(/^\d+\.\s/, "");

  let newLine: string;
  let newCursor: number;

  if (type === "bullet") {
    if (isBullet) {
      newLine = indent + cleaned;
      newCursor = lineStart + indent.length;
    } else {
      newLine = indent + "- " + cleaned;
      newCursor = lineStart + indent.length + 2;
    }
  } else if (type === "checklist") {
    if (isChecklist) {
      newLine = indent + cleaned;
      newCursor = lineStart + indent.length;
    } else {
      newLine = indent + "- [ ] " + cleaned;
      newCursor = lineStart + indent.length + 6;
    }
  } else {
    if (isNumbered) {
      newLine = indent + cleaned;
      newCursor = lineStart + indent.length;
    } else {
      newLine = indent + "1. " + cleaned;
      newCursor = lineStart + indent.length + 3;
    }
  }

  const newText = text.slice(0, lineStart) + newLine + text.slice(lineEnd);
  return { text: newText, cursor: newCursor, selectionEnd: newCursor };
}

/** Set/clear a heading prefix (#, ##, ###) on the current line. */
export function applyTextStyle(
  sel: Selection,
  style: BlockTextStyle,
): Selection {
  const { text } = sel;
  const cursor = sel.cursor;
  const { lineStart, lineEnd, line } = currentLine(text, cursor);
  const stripped = line
    .replace(/^### /, "")
    .replace(/^## /, "")
    .replace(/^# /, "");

  const prefix =
    style === "NORMAL"
      ? ""
      : style === "H1"
        ? "# "
        : style === "H2"
          ? "## "
          : "### ";
  const newLine = prefix + stripped;
  const newText = text.slice(0, lineStart) + newLine + text.slice(lineEnd);
  const newCursor = cursor + (prefix.length - (line.length - stripped.length));

  return { text: newText, cursor: newCursor, selectionEnd: newCursor };
}

function isCursorInsideMarker(
  text: string,
  cursor: number,
  marker: string,
): boolean {
  if (!marker) return false;
  const open = text.lastIndexOf(marker, cursor);
  if (open === -1) return false;
  const close = text.indexOf(marker, open + marker.length);
  if (close === -1) return false;
  const contentStart = open + marker.length;
  const contentEnd = close + marker.length;
  return cursor >= contentStart && cursor <= contentEnd;
}

function isCursorInsideSingleStar(text: string, cursor: number): boolean {
  if (!text) return false;
  const before = text.lastIndexOf("*", cursor - 1);
  if (before === -1) return false;
  if (before > 0 && text[before - 1] === "*") return false;
  const after = text.indexOf("*", cursor);
  if (after === -1) return false;
  if (after + 1 < text.length && text[after + 1] === "*") return false;
  return before < cursor && after >= cursor;
}

/** Detect current line/inline formatting at the cursor, to highlight active toolbar buttons. */
export function detectFormatting(sel: Selection): SelectionFormatting {
  const { text } = sel;
  const cursor = Math.min(Math.max(sel.cursor, 0), text.length);
  const { line } = currentLine(text, cursor);

  const textStyle: BlockTextStyle = line.startsWith("### ")
    ? "H3"
    : line.startsWith("## ")
      ? "H2"
      : line.startsWith("# ")
        ? "H1"
        : "NORMAL";

  const checklist = line.startsWith("- [ ] ") || line.startsWith("- [x] ");
  const bullet = line.startsWith("- ") && !checklist;
  const numbered = /^\d+\.\s/.test(line);

  return {
    bold: isCursorInsideMarker(text, cursor, "**"),
    italic: isCursorInsideSingleStar(text, cursor),
    code: isCursorInsideMarker(text, cursor, "`"),
    textStyle,
    bullet,
    checklist,
    numbered,
  };
}
