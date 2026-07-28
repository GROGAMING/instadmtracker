import Link from "next/link";
import { redirect } from "next/navigation";
import { sb, whoAmI } from "@/lib/supabase-server";
import { today, type Lead, type Profile } from "@/lib/types";
import { Docket, Masthead, Nav } from "./ui";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ who?: string }>;
}) {
  const who = (await searchParams).who === "all" ? "all" : "mine";
  const me_id = await whoAmI();
  if (!me_id) redirect("/who");
  const db = sb();
  const ref = today();

  const { data: profiles } = await db.from("profiles").select("*");
  const people = (profiles ?? []) as Profile[];
  const me = people.find((p) => p.id === me_id);

  let q = db
    .from("leads")
    .select("*")
    .eq("status", "follow_up")
    .lte("follow_up_date", ref)
    .order("follow_up_date", { ascending: true });
  if (who === "mine") q = q.eq("assigned_to", me_id);

  const { data, error } = await q;
  const leads = (data ?? []) as Lead[];
  const late = leads.filter((l) => l.follow_up_date! < ref);
  const due = leads.filter((l) => l.follow_up_date === ref);

  const stamp = new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin", weekday: "short", day: "numeric", month: "short",
  }).format(new Date());

  return (
    <>
      <main className="shell">
        <Masthead stamp={me?.name ?? "You"} />
        <h2 className="page-title">Message today</h2>
        <p className="page-sub">{stamp} · {leads.length} to send · {late.length} overdue</p>

        <div className="toggle">
          <Link href="/?who=mine" aria-current={who === "mine"}>Mine</Link>
          <Link href="/?who=all" aria-current={who === "all"}>Everyone</Link>
        </div>

        {error && <p className="notice">Could not load: {error.message}</p>}

        {!error && leads.length === 0 && (
          <div className="empty">
            <strong>Nothing due</strong>
            No follow-ups scheduled for today. Add a lead or work through the pipeline.
          </div>
        )}

        {late.length > 0 && (
          <>
            <p className="section-rule">Overdue</p>
            {late.map((l) => (
              <Docket key={l.id} lead={l} refDate={ref}
                owner={who === "all" ? people.find((p) => p.id === l.assigned_to) : undefined} />
            ))}
          </>
        )}

        {due.length > 0 && (
          <>
            <p className="section-rule">Due today</p>
            {due.map((l) => (
              <Docket key={l.id} lead={l} refDate={ref}
                owner={who === "all" ? people.find((p) => p.id === l.assigned_to) : undefined} />
            ))}
          </>
        )}
      </main>
      <Nav active="today" />
    </>
  );
}
