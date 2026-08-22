import { Component, inject } from "@angular/core";
import { NoteEditorStore } from "../../note-editor.store";
import { ScreenMode } from "../../models/screen-mode";
import { EditorBlock } from "../../../data-access/notes/note-blocks.model";
import {
  parseEditorBlocks,
  toggleChecklistLine,
} from "../../../data-access/notes/note-blocks-parser";
import { InlineSpan, renderInlineMarkdown } from "../../utils/inline-markdown";

@Component({
  selector: "app-note-preview",
  templateUrl: "./note-preview.component.html",
  styleUrl: "./note-preview.component.scss",
})
export class NotePreviewComponent {
  private readonly store = inject(NoteEditorStore);

  blocks(): EditorBlock[] {
    return parseEditorBlocks(this.store.vm().text);
  }

  onToggleChecklist(lineIndex: number): void {
    const newText = toggleChecklistLine(this.store.vm().text, lineIndex);
    if (this.store.vm().screenMode === ScreenMode.Read) {
      this.store.toggleChecklistReadOnly(newText);
    } else {
      this.store.setText(newText);
    }
  }

  spans(text: string): InlineSpan[] {
    return renderInlineMarkdown(text);
  }

  indentLevel(line: string): number {
    const leading = line.match(/^ */)?.[0].length ?? 0;
    return Math.floor(leading / 2);
  }

  stripBulletPrefix(line: string): string {
    return line.trimStart().replace(/^- /, "");
  }

  stripNumberPrefix(line: string): string {
    return line.trimStart().replace(/^\d+\.\s/, "");
  }

  extractNumber(line: string): number {
    return parseInt(/^(\d+)\./.exec(line.trimStart())?.[1] ?? "1", 10);
  }
}
