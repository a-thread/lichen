import {
  Component,
  Injector,
  afterNextRender,
  inject,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NoteEditorStore } from "./note-editor.store";
import { transformEditorInput } from "./utils/editor-input-transform";
import { Selection } from "../shared/utils/toolbar-actions";
import { FormattingToolbarComponent } from "../shared/components/formatting-toolbar/formatting-toolbar.component";
import { NotePreviewComponent } from "./components/note-preview/note-preview.component";
import { DiscardDialogComponent } from "./components/discard-dialog/discard-dialog.component";
import { IconComponent } from "../shared/components/icon/icon.component";
import { EditorMode } from "./models/editor-mode";
import { ScreenMode } from "./models/screen-mode";

@Component({
  selector: "app-note-editor",
  imports: [
    FormsModule,
    FormattingToolbarComponent,
    NotePreviewComponent,
    DiscardDialogComponent,
    IconComponent,
  ],
  providers: [NoteEditorStore],
  templateUrl: "./note-editor.component.html",
  styleUrl: "./note-editor.component.scss",
})
export class NoteEditorComponent {
  protected readonly store = inject(NoteEditorStore);
  protected readonly EditorMode = EditorMode;
  protected readonly ScreenMode = ScreenMode;
  private readonly injector = inject(Injector);

  bodyInput = viewChild<{ nativeElement: HTMLTextAreaElement }>("bodyInput");
  private caret = 0;

  private nativeTextarea(): HTMLTextAreaElement | undefined {
    return this.bodyInput()?.nativeElement;
  }

  onCaretMoved(): void {
    const el = this.nativeTextarea();
    if (el) this.caret = el.selectionStart ?? this.store.text().length;
  }

  onBodyChange(newValue: string): void {
    const el = this.nativeTextarea();
    const newCursor = el?.selectionStart ?? newValue.length;
    const result = transformEditorInput(
      { text: this.store.text(), cursor: this.caret },
      { text: newValue, cursor: newCursor },
    );
    this.store.setText(result.text);
    this.caret = result.cursor;
    if (el) {
      // Write the transformed text and selection synchronously — change detection
      // (zoneless) re-renders on the next animation frame, which is too late: restoring
      // the cursor there would race the framework's own write to `el.value` and lose,
      // since a differing value resets the caret to the end.
      el.value = result.text;
      el.setSelectionRange(result.cursor, result.cursor);
    }
  }

  currentSelection(): Selection {
    const el = this.nativeTextarea();
    const start = el?.selectionStart ?? this.caret;
    const end = el?.selectionEnd ?? this.caret;
    return { text: this.store.text(), cursor: start, selectionEnd: end };
  }

  applyToolbarResult(result: Selection): void {
    this.store.setText(result.text);
    this.caret = result.cursor;
    const el = this.nativeTextarea();
    if (el) {
      el.value = result.text;
      el.focus();
      el.setSelectionRange(result.cursor, result.selectionEnd);
    }
  }

  enterEdit(): void {
    this.store.enterEdit();
    // The textarea doesn't exist yet — it's behind an @if that flips on this same
    // update — so this has to wait for Angular to actually commit the DOM, not just
    // a microtask (which can still run before the framework's own render pass).
    afterNextRender(
      () => {
        const el = this.nativeTextarea();
        const end = this.store.text().length;
        el?.focus();
        el?.setSelectionRange(end, end);
        this.caret = end;
      },
      { injector: this.injector },
    );
  }
}
