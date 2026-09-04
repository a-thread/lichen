import { Injectable } from "@angular/core";
import { IDBPDatabase, openDB } from "idb";
import { Note, PendingChange } from "./note.model";

const DB_NAME = "lichen";
const DB_VERSION = 1;
const NOTES_STORE = "notes";
const QUEUE_STORE = "pending-changes";

@Injectable({ providedIn: "root" })
export class NotesOfflineService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          db.createObjectStore(NOTES_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          db.createObjectStore(QUEUE_STORE, { keyPath: "noteId" });
        }
      },
    });
  }

  /** Scoped to the signed-in user — the local cache is a single IndexedDB store shared by whoever last used this browser. */
  async getAllNotes(userId: string): Promise<Note[]> {
    const db = await this.dbPromise;
    const all: Note[] = await db.getAll(NOTES_STORE);
    return all.filter((note) => note.user_id === userId);
  }

  /** Wipes the local cache. Call on sign-out so the next user on this device doesn't see stale notes before their own data loads. */
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction([NOTES_STORE, QUEUE_STORE], "readwrite");
    await Promise.all([
      tx.objectStore(NOTES_STORE).clear(),
      tx.objectStore(QUEUE_STORE).clear(),
    ]);
    await tx.done;
  }

  async getNote(id: string): Promise<Note | undefined> {
    const db = await this.dbPromise;
    return db.get(NOTES_STORE, id);
  }

  async putNote(note: Note): Promise<void> {
    const db = await this.dbPromise;
    await db.put(NOTES_STORE, note);
  }

  async putNotes(notes: Note[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(NOTES_STORE, "readwrite");
    await Promise.all(notes.map((n) => tx.store.put(n)));
    await tx.done;
  }

  async deleteNote(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(NOTES_STORE, id);
  }

  async queueChange(change: PendingChange): Promise<void> {
    const db = await this.dbPromise;
    await db.put(QUEUE_STORE, change);
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    const db = await this.dbPromise;
    return db.getAll(QUEUE_STORE);
  }

  async clearPendingChange(noteId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(QUEUE_STORE, noteId);
  }
}
