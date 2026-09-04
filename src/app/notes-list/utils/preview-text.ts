import { parseBodyText } from "../../data-access/notes/note.model";
import { parseEditorBlocks } from "../../data-access/notes/note-blocks-parser";

/** First-block plain-text snippet shown under a note's title in the list. */
export function previewText(body: string): string {
  const text = parseBodyText(body);
  const firstBlock = parseEditorBlocks(text)[0];
  if (!firstBlock) return "";
  if (firstBlock.type === "text" || firstBlock.type === "heading")
    return firstBlock.text.slice(0, 80);
  if (firstBlock.type === "checklist" || firstBlock.type === "numberedList")
    return firstBlock.items[0]?.text.slice(0, 80) ?? "";
  if (firstBlock.type === "bulletList")
    return firstBlock.items[0]?.slice(0, 80) ?? "";
  return text.slice(0, 80);
}
