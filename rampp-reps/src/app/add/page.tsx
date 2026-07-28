import { supabaseServer } from "@/lib/supabase-server";
import { today, type Profile } from "@/lib/types";
import { Masthead, Nav } from "../ui";
import AddForm from "./form";

export const dynamic = "force-dynamic";

export default async function AddPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data } = await sb.from("profiles").select("*").eq("is_active", true);
  const people = (data ?? []) as Profile[];
  const me = people.find((p) => p.id === user!.id);

  return (
    <>
      <main className="shell">
        <Masthead stamp={me?.name ?? "You"} />
        <h2 className="page-title">Add a lead</h2>
        <p className="page-sub">Name and handle are the only must-haves</p>
        <AddForm people={people} meId={user!.id} defaultDate={today()} />
      </main>
      <Nav active="add" />
    </>
  );
}
