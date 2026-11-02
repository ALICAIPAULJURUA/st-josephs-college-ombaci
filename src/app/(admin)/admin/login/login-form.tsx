"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="admin-login-form">
      {expired ? (
        <p className="admin-alert" role="status">
          You were signed out after 8 hours without activity. Please sign in
          again.
        </p>
      ) : null}
      <label className="admin-field">
        <span>Email address</span>
        <input
          autoComplete="username"
          autoFocus
          name="email"
          required
          type="email"
        />
      </label>
      <label className="admin-field">
        <span>Password</span>
        <input
          autoComplete="current-password"
          maxLength={256}
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p className="admin-alert" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="admin-button admin-button-primary" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
