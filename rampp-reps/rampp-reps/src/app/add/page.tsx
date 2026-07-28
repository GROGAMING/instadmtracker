import { redirect } from "next/navigation";
import { sb, whoAmI } from "@/lib/supabase-server";
import { today, type Profile } from "@/lib/types";
import { Masthead, Nav } from "../ui";
import AddForm from "./form";

export const dynamic = "force-dynamic";

export default async function AddPage() {
  const me_id = await whoAmI();
  if (!me_id) redirect("/who");
  const { data } = await sb().from("profiles").select("*").eq("is_active", true);
  const people = (data ?? []) as Profile[];
  const me = people.find((p) => p.id === me_id);

  return (
    <>
      <main className="shell">
        <Masthead stamp={me?.name ?? "You"} />
        <h2 className="page-title">Add a lead</h2>
        <p className="page-sub">Name and handle are the only must-haves</p>
        <AddForm people={people} meId={me_id} defaultDate={today()} />
      </main>
      <Nav active="add" />
    </>
  );
}
