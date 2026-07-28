import { sb } from "@/lib/supabase-server";
import type { Profile } from "@/lib/types";
import { chooseWho } from "../actions";

export const dynamic = "force-dynamic";

export default async function WhoPage() {
  const { data } = await sb().from("profiles").select("*").eq("is_active", true);
  const people = (data ?? []) as Profile[];

  return (
    <main className="shell">
      <header className="masthead">
        <h1 className="wordmark">
          Rampp <span>/ Reps</span>
        </h1>
      </header>

      <h2 className="page-title">Who are you?</h2>
      <p className="page-sub">Pick your name to start</p>

      {people.length === 0 && (
        <div className="empty">
          <strong>No names set up</strong>
          Add a row to the profiles table in Supabase, then reload this page.
        </div>
      )}

      {people.map((p) => (
        <form key={p.id} action={chooseWho} style={{ marginBottom: 12 }}>
          <input type="hidden" name="id" value={p.id} />
          <button className="btn btn-block" type="submit">
            {p.name}
          </button>
        </form>
      ))}
    </main>
  );
}
