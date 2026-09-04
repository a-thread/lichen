import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { Note, parseBodyText } from "../data-access/notes/note.model";
import { NotesStore } from "../data-access/notes/notes.store";
import { AuthStore } from "../data-access/auth/auth.store";
import { ToastStore } from "../shared/state/toast.store";
import { NotesSort } from "../data-access/notes/notes-sort";
import { formatAllNotesExport } from "../shared/utils/export-format";
import { downloadTextFile } from "../shared/utils/download-file";
import { ListLayout } from "./models/list-layout";
import { previewText } from "./utils/preview-text";

type NotesListState = {
  search: string;
  layout: ListLayout;
  menuOpen: boolean;
  searchOpen: boolean;
};

const initialState: NotesListState = {
  search: "",
  layout: ListLayout.Grid,
  menuOpen: false,
  searchOpen: false,
};

export const NotesListStore = signalStore(
  withState(initialState),
  withComputed(({ search, layout, menuOpen, searchOpen }) => {
    const notesStore = inject(NotesStore);

    return {
      vm: computed(() => {
        const query = search().trim().toLowerCase();
        const allNotes = notesStore.sortedNotes();
        const filtered = query
          ? allNotes.filter(
              (note) =>
                note.title.toLowerCase().includes(query) ||
                parseBodyText(note.body).toLowerCase().includes(query),
            )
          : allNotes;
        // Computed once here (not per template render) since parsing a note's
        // body for its preview snippet is real work, and this view re-renders
        // on things unrelated to note content — search input, menu toggling.
        const filteredNotes = filtered.map((note) => ({
          note,
          preview: previewText(note.body),
        }));

        return {
          search: search(),
          layout: layout(),
          menuOpen: menuOpen(),
          searchOpen: searchOpen(),
          notes: notesStore.notes(),
          sort: notesStore.sort(),
          filteredNotes,
        };
      }),
    };
  }),
  withMethods((store) => {
    const notesStore = inject(NotesStore);
    const auth = inject(AuthStore);
    const toast = inject(ToastStore);

    return {
      setSearch(search: string): void {
        patchState(store, { search });
      },

      toggleLayout(): void {
        patchState(store, {
          layout:
            store.layout() === ListLayout.Grid
              ? ListLayout.List
              : ListLayout.Grid,
        });
      },

      openSearch(): void {
        patchState(store, { searchOpen: true });
      },

      closeSearch(): void {
        patchState(store, { searchOpen: false, search: "" });
      },

      openMenu(): void {
        patchState(store, { menuOpen: true });
      },

      closeMenu(): void {
        patchState(store, { menuOpen: false });
      },

      onSortChange(sort: NotesSort): void {
        notesStore.setSort(sort);
      },

      async deleteNote(note: Note): Promise<void> {
        await notesStore.deleteNote(note.id);
        toast.show("Note deleted", {
          actionLabel: "Undo",
          onAction: () => notesStore.restoreNote(note),
        });
      },

      async importNote(title: string, content: string): Promise<void> {
        const userId = auth.userId();
        if (!userId) return;
        await notesStore.createNote(userId, title, content);
        toast.show("Note imported");
      },

      exportAll(): void {
        downloadTextFile(
          "lichen-notes-export.txt",
          formatAllNotesExport(notesStore.notes()),
        );
        toast.show("Export complete");
      },
    };
  }),
  withHooks({
    onInit() {
      inject(NotesStore).refreshFromRemote();
    },
  }),
);
