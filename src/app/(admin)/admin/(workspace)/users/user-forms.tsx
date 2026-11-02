"use client";

import { useActionState } from "react";

import {
  createStaffUserAction,
  resetStaffPasswordAction,
  type UserActionState,
} from "./actions";

const initialState: UserActionState = {};

export function AddStaffUserForm() {
  const [state, action, pending] = useActionState(
    createStaffUserAction,
    initialState,
  );

  return (
    <form action={action} className="admin-form admin-form-card">
      <h2>Add a staff account</h2>
      <div className="admin-upload-grid">
        <label className="admin-field">
          Email address
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
        <label className="admin-field">
          Temporary password
          <input
            autoComplete="new-password"
            minLength={12}
            maxLength={256}
            name="password"
            required
            type="password"
          />
          <span className="admin-media-note">
            Use at least 12 characters. Share it safely and ask them to change
            it.
          </span>
        </label>
        <label className="admin-field">
          What this person can do
          <select defaultValue="editor" name="role">
            <option value="admin">Administrator</option>
            <option value="editor">Editor</option>
            <option value="admissions">Admissions</option>
          </select>
        </label>
      </div>
      <button className="admin-button admin-button-primary" disabled={pending}>
        {pending ? "Adding account..." : "Add account"}
      </button>
      <p
        className={`admin-status${state.error ? " admin-status-error" : ""}`}
        aria-live="polite"
      >
        {state.error ?? state.message}
      </p>
    </form>
  );
}

export function ResetStaffPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    resetStaffPasswordAction,
    initialState,
  );

  return (
    <form action={action} className="admin-form">
      <input name="userId" type="hidden" value={userId} />
      <label className="admin-field">
        New password
        <input
          autoComplete="new-password"
          minLength={12}
          maxLength={256}
          name="password"
          required
          type="password"
        />
      </label>
      <button className="admin-button" disabled={pending}>
        {pending ? "Updating..." : "Reset password"}
      </button>
      <p
        className={`admin-status${state.error ? " admin-status-error" : ""}`}
        aria-live="polite"
      >
        {state.error ?? state.message}
      </p>
    </form>
  );
}
