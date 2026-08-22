import { computed, effect, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
import { formatSingleNoteExport } from "../shared/utils/export-format";
import { downloadTextFile } from "../shared/utils/download-file";
import { EditorMode } from "./models/editor-mode";
import { ScreenMode } from "./models/screen-mode";

type NoteEditorState = {
  title: string;
  text: string;
  mode: EditorMode;
  screenMode: ScreenMode;
  existingNote: Note | undefined;
  showDiscardDialog: boolean;
  originalTitle: string;
  originalText: string;
  loadedFromNote: boolean;
};

const initialState: NoteEditorState = {
  title: "",
  text: "",
  mode: EditorMode.Write,
  screenMode: ScreenMode.Edit,
  existingNote: undefined,
  showDiscardDialog: false,
  originalTitle: "",
  originalText: "",
  loadedFromNote: false,
};

export const NoteEditorStore = signalStore(
  withState(initialState),
  withComputed(({ title, text, originalTitle, originalText }) => ({
    hasUnsavedChanges: computed(
      () => title() !== originalTitle() || text() !== originalText(),
    ),
  })),
  withComputed((store) => ({
    vm: computed(() => ({
      title: store.title(),
      text: store.text(),
      mode: store.mode(),
      screenMode: store.screenMode(),
      existingNote: store.existingNote(),
      showDiscardDialog: store.showDiscardDialog(),
    })),
  })),
  withMethods((store) => {
    const router = inject(Router);
    const notesStore = inject(NotesStore);
    const auth = inject(AuthStore);
    const toast = inject(ToastStore);

    function exitEditNoChanges(): void {
      // Only "close edit without saving" drops back to the read view. Back from
      // the read view itself (or closing a brand-new, still-unsaved note)
      // actually leaves the screen.
      if (store.screenMode() === ScreenMode.Edit && store.existingNote()) {
        patchState(store, { screenMode: ScreenMode.Read });
        return;
      }
      router.navigate(["/"]);
    }

    return {
      setTitle(title: string): void {
        patchState(store, { title });
      },

      setText(text: string): void {
        patchState(store, { text });
      },

      setMode(mode: EditorMode): void {
        patchState(store, { mode });
      },

      /** Checklist toggles from the read-only view save immediately — there's no Save action on that screen. */
      async toggleChecklistReadOnly(text: string): Promise<void> {
        const note = store.existingNote();
        if (!note) return;
        patchState(store, { text, originalText: text });
        await notesStore.updateNote(note, store.title(), text);
        patchState(store, {
          existingNote:
            notesStore.notes().find((n) => n.id === note.id) ?? note,
        });
      },

      enterEdit(): void {
        patchState(store, { screenMode: ScreenMode.Edit });
      },

      requestClose(): void {
        if (store.hasUnsavedChanges()) {
          patchState(store, { showDiscardDialog: true });
          return;
        }
        exitEditNoChanges();
      },

      confirmDiscard(): void {
        patchState(store, {
          title: store.originalTitle(),
          text: store.originalText(),
          showDiscardDialog: false,
        });
        exitEditNoChanges();
      },

      cancelDiscard(): void {
        patchState(store, { showDiscardDialog: false });
      },

      async save(): Promise<void> {
        const userId = auth.userId();
        if (!userId) return; // route is guarded, but guard defensively

        const note = store.existingNote();
        if (note) {
          await notesStore.updateNote(note, store.title(), store.text());
          patchState(store, {
            existingNote:
              notesStore.notes().find((n) => n.id === note.id) ?? note,
          });
        } else {
          const created = await notesStore.createNote(
            userId,
            store.title(),
            store.text(),
          );
          patchState(store, { existingNote: created });
          router.navigate(["/note", created.id], { replaceUrl: true });
        }

        patchState(store, {
          originalTitle: store.title(),
          originalText: store.text(),
          screenMode: ScreenMode.Read,
        });
      },

      async remove(): Promise<void> {
        const note = store.existingNote();
        if (!note) return;
        await notesStore.deleteNote(note.id);
        router.navigate(["/"]);
      },

      exportNote(): void {
        const note = store.existingNote();
        if (!note) return;
        const { filename, content } = formatSingleNoteExport(note);
        downloadTextFile(filename, content);
        toast.show("Export complete");
      },
    };
  }),
  withHooks({
    onInit(store) {
      const route = inject(ActivatedRoute);
      const notesStore = inject(NotesStore);

      // A direct navigation (fresh tab, hard refresh, pasted link) may land here
      // before the local cache has ever synced with Supabase — make sure this
      // note has a chance to show up even on a device/session with nothing
      // cached locally yet.
      if (route.snapshot.paramMap.get("id")) {
        notesStore.refreshFromRemote();
      }

      // NotesStore loads from IndexedDB asynchronously, so on a direct
      // navigation `notes()` can still be empty when this store is created.
      // Watch it reactively instead of doing a one-shot lookup.
      effect(() => {
        if (store.loadedFromNote()) return;
        const id = route.snapshot.paramMap.get("id");
        if (!id) return; // new note — screenMode stays 'edit'

        const note = notesStore.notes().find((n) => n.id === id);
        if (!note) return;

        const text = parseBodyText(note.body);
        patchState(store, {
          loadedFromNote: true,
          existingNote: note,
          title: note.title,
          text,
          originalTitle: note.title,
          originalText: text,
          screenMode: ScreenMode.Read,
        });
      });
    },
  }),
);
