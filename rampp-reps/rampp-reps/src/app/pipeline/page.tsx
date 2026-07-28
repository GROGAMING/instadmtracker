import Link from "next/link";
import { redirect } from "next/navigation";
import { sb, whoAmI } from "@/lib/supabase-server";
import {
  STATUS_LABEL,
  today,
  type Lead,
  type Profile,
  type Status,
} from "@/lib/types";
import { closeColdLeads } from "../actions";
import { Docket, isCold, Masthead, Nav } from "../ui";

export const dynamic = "force-dynamic";

const TABS: Status[] = ["not_messaged", "sent", "follow_up", "link_sent", "closed"];

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; who?: string }>;
}) {
  const params = await searchParams;
  const status = (TABS.includes(params.status as Status)
    ? params.status
    : "not_messaged") as Status;
  const who = params.who === "all" ? "all" : "mine";

  const me_id = await whoAmI();
  if (!me_id) redirect("/who");
  const db = sb();

  const { data: profiles } = await db.from("profiles").select("*");
  const people = (profiles ?? []) as Profile[];
  const me = people.find((p) => p.id === me_id);

  let q = db.from("leads").select("*").eq("status", status);
  if (who === "mine") q = q.eq("assigned_to", me_id);

  // Sent goes oldest first so the quietest leads surface at the top.
  const { data, error } = await (status === "sent"
    ? q.order("sent_at", { ascending: true, nullsFirst: true })
    : status === "follow_up"
      ? q.order("follow_up_date", { ascending: true })
      : q.order("created_at", { ascending: false })
  ).limit(500);

  const leads = (data ?? []) as Lead[];
  const ref = today();
  const coldCount = leads.filter(isCold).length;

  const link = (s: Status) => `/pipeline?status=${s}&who=${who}`;

  return (
    <>
      <main className="shell">
        <Masthead stamp={me?.name ?? "You"} />
        <h2 className="page-title">Pipeline</h2>
        <p className="page-sub">{leads.length} in {STATUS_LABEL[status]}</p>

        <div className="chips">
          {TABS.map((s) => (
            <Link
              key={s}
              className="chip"
              aria-current={status === s}
              href={link(s)}
            >
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>

        <div className="toggle">
          <Link
            href={`/pipeline?status=${status}&who=mine`}
            aria-current={who === "mine"}
          >
            Mine
          </Link>
          <Link
            href={`/pipeline?status=${status}&who=all`}
            aria-current={who === "all"}
          >
            Everyone
          </Link>
        </div>

        {status === "sent" && coldCount > 0 && (
          <div className="bar">
            <span>
              {coldCount} gone quiet 14+ days
            </span>
            <form action={closeColdLeads}>
              <button className="btn btn-dead" type="submit">
                Close all cold
              </button>
            </form>
          </div>
        )}

        {error && <p className="notice">Could not load: {error.message}</p>}

        {!error && leads.length === 0 && (
          <div className="empty">
            <strong>Empty</strong>
            Nothing sitting in {STATUS_LABEL[status]} right now.
          </div>
        )}

        {leads.map((l) => (
          <Docket
            key={l.id}
            lead={l}
            refDate={ref}
            owner={
              who === "all" ? people.find((p) => p.id === l.assigned_to) : undefined
            }
          />
        ))}
      </main>
      <Nav active="pipeline" />
    </>
  );
}
