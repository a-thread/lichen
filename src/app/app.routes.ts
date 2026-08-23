import { Routes } from "@angular/router";
import { authGuard } from "./data-access/auth/auth.guard";

export const routes: Routes = [
  {
    path: "login",
    title: "Sign in · Lichen",
    loadComponent: () =>
      import("./auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "signup",
    title: "Create account · Lichen",
    loadComponent: () =>
      import("./auth/create-account/create-account.component").then(
        (m) => m.CreateAccountComponent,
      ),
  },
  {
    path: "forgot-password",
    title: "Forgot password · Lichen",
    loadComponent: () =>
      import("./auth/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: "reset-password",
    title: "Reset password · Lichen",
    loadComponent: () =>
      import("./auth/reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: "",
    title: "Your notes · Lichen",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./notes-list/notes-list.component").then(
        (m) => m.NotesListComponent,
      ),
    children: [
      {
        path: "note/new",
        title: "New note · Lichen",
        loadComponent: () =>
          import("./note-editor/note-editor.component").then(
            (m) => m.NoteEditorComponent,
          ),
      },
      {
        path: "note/:id",
        title: "Edit note · Lichen",
        loadComponent: () =>
          import("./note-editor/note-editor.component").then(
            (m) => m.NoteEditorComponent,
          ),
      },
    ],
  },
  {
    path: "about",
    title: "About · Lichen",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./about/about.component").then((m) => m.AboutComponent),
  },
];
