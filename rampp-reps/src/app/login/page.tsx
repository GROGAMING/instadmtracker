"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState<string | null, FormData>(
    signIn,
    null,
  );

  return (
    <main className="shell">
      <header className="masthead">
        <h1 className="wordmark">
          Rampp <span>/ Reps</span>
        </h1>
      </header>
      <h2 className="page-title">Sign in</h2>
      <p className="page-sub">Club rep outreach</p>

      {error && <p className="notice">{error}</p>}

      <form action={action}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            autoCapitalize="none"
            required
            autoFocus
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="btn btn-block" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
