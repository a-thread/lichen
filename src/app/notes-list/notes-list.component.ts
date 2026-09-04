import { Component, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterOutlet } from "@angular/router";
import { NotesListStore } from "./notes-list.store";
import { NotesSort, NOTES_SORT_LABELS } from "../data-access/notes/notes-sort";
import { titleFromImportFilename } from "../shared/utils/export-format";
import { IconComponent } from "../shared/components/icon/icon.component";
import { ListLayout } from "./models/list-layout";

@Component({
  selector: "app-notes-list",
  imports: [RouterLink, RouterOutlet, FormsModule, IconComponent],
  providers: [NotesListStore],
  templateUrl: "./notes-list.component.html",
  styleUrl: "./notes-list.component.scss",
})
export class NotesListComponent {
  protected readonly store = inject(NotesListStore);
  protected readonly ListLayout = ListLayout;

  /** Set while a child route (the note editor) is activated in the outlet below. */
  protected readonly childActive = signal(false);

  fileInput = viewChild<{ nativeElement: HTMLInputElement }>("fileInput");
  searchInput = viewChild<{ nativeElement: HTMLInputElement }>("searchInput");
  menuTrigger = viewChild<{ nativeElement: HTMLButtonElement }>("menuTrigger");
  firstMenuItem = viewChild<{ nativeElement: HTMLButtonElement }>(
    "firstMenuItem",
  );

  readonly sortOptions = Object.entries(NOTES_SORT_LABELS) as [
    NotesSort,
    string,
  ][];

  toggleSearch(): void {
    if (this.store.searchOpen()) {
      this.store.closeSearch();
      return;
    }
    this.store.openSearch();
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
  }

  toggleMenu(): void {
    if (this.store.menuOpen()) {
      this.closeMenu();
      return;
    }
    this.store.openMenu();
    queueMicrotask(() => this.firstMenuItem()?.nativeElement.focus());
  }

  closeMenu(): void {
    this.store.closeMenu();
    queueMicrotask(() => this.menuTrigger()?.nativeElement.focus());
  }

  triggerImport(): void {
    this.closeMenu();
    this.fileInput()?.nativeElement.click();
  }

  exportAll(): void {
    this.closeMenu();
    this.store.exportAll();
  }

  async onImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    const content = await file.text();
    if (!content.trim()) return;

    await this.store.importNote(
      titleFromImportFilename(file.name),
      content.trim(),
    );
  }
}
