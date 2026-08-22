import {
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from "@angular/core";
import { NoteEditorStore } from "../../note-editor.store";

@Component({
  selector: "app-discard-dialog",
  templateUrl: "./discard-dialog.component.html",
  styleUrl: "./discard-dialog.component.scss",
})
export class DiscardDialogComponent {
  private readonly store = inject(NoteEditorStore);

  private readonly cancelButton =
    viewChild<ElementRef<HTMLButtonElement>>("cancelButton");
  private readonly confirmButton =
    viewChild<ElementRef<HTMLButtonElement>>("confirmButton");
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        queueMicrotask(() => this.cancelButton()?.nativeElement.focus());
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });
  }

  open(): boolean {
    return this.store.vm().showDiscardDialog;
  }

  confirm(): void {
    this.store.confirmDiscard();
  }

  cancel(): void {
    this.store.cancelDiscard();
  }

  /** Keeps focus cycling between the two dialog buttons — they're the only focusables. */
  onTab(domEvent: Event): void {
    const event = domEvent as KeyboardEvent;
    const cancel = this.cancelButton()?.nativeElement;
    const confirm = this.confirmButton()?.nativeElement;
    if (!cancel || !confirm) return;

    if (event.shiftKey && document.activeElement === cancel) {
      event.preventDefault();
      confirm.focus();
    } else if (!event.shiftKey && document.activeElement === confirm) {
      event.preventDefault();
      cancel.focus();
    }
  }
}
