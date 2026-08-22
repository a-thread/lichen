import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Note } from "./note.model";
import { NotesApiService } from "./notes-api.service";

type OperationState = { loading: boolean; error: string | null };

type NotesApiState = {
  fetch: OperationState;
  upsert: OperationState;
  delete: OperationState;
};

const idle: OperationState = { loading: false, error: null };

const initialState: NotesApiState = {
  fetch: idle,
  upsert: idle,
  delete: idle,
};

export const NotesApiStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const api = inject(NotesApiService);

    return {
      async fetchNotes(userId: string): Promise<Note[]> {
        patchState(store, { fetch: { loading: true, error: null } });
        try {
          const notes = await api.fetchNotes(userId);
          patchState(store, { fetch: { loading: false, error: null } });
          return notes;
        } catch (err: any) {
          patchState(store, {
            fetch: {
              loading: false,
              error: err?.message ?? "Failed to fetch notes",
            },
          });
          throw err;
        }
      },

      async upsertNote(note: Note): Promise<void> {
        patchState(store, { upsert: { loading: true, error: null } });
        try {
          await api.upsertNote(note);
          patchState(store, { upsert: { loading: false, error: null } });
        } catch (err: any) {
          patchState(store, {
            upsert: {
              loading: false,
              error: err?.message ?? "Failed to save note",
            },
          });
          throw err;
        }
      },

      async deleteNote(id: string, userId: string): Promise<void> {
        patchState(store, { delete: { loading: true, error: null } });
        try {
          await api.deleteNote(id, userId);
          patchState(store, { delete: { loading: false, error: null } });
        } catch (err: any) {
          patchState(store, {
            delete: {
              loading: false,
              error: err?.message ?? "Failed to delete note",
            },
          });
          throw err;
        }
      },
    };
  }),
);
