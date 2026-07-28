import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { STATUS_LABEL, type Lead, type Profile, type Status } from "@/lib/types";
import { deleteLead, updateLead } from "../../actions";
import { Masthead, Nav } from "../../ui";

export const dynamic = "force-dynamic";

const ORDER: Status[] = ["not_messaged", "sent", "follow_up", "link_sent", "closed"];

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await supabaseServer();

  const { data } = await sb.from("leads").select("*").eq("id", id).single();
  if (!data) notFound();
  const lead = data as Lead;

  const { data: p } = await sb.from("profiles").select("*").eq("is_active", true);
  const people = (p ?? []) as Profile[];

  return (
    <>
      <main className="shell">
        <Masthead stamp="Edit" />
        <h2 className="page-title">{lead.player_name}</h2>
        <p className="page-sub">Added {lead.created_at.slice(0, 10)}</p>

        <form action={updateLead}>
          <input type="hidden" name="id" value={lead.id} />

          <label className="field">
            <span>Player name</span>
            <input type="text" name="player_name" defaultValue={lead.player_name} required />
          </label>

          <label className="field">
            <span>Instagram handle</span>
            <input type="text" name="instagram_handle" defaultValue={lead.instagram_handle}
              autoCapitalize="none" required />
          </label>

          <label className="field">
            <span>Club</span>
            <input type="text" name="club" defaultValue={lead.club ?? ""} />
          </label>

          <label className="field">
            <span>County</span>
            <input type="text" name="county" defaultValue={lead.county ?? ""} />
          </label>

          <label className="check">
            <input type="checkbox" name="is_intercounty" defaultChecked={lead.is_intercounty} />
            <span>Inter-county player</span>
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={lead.status}>
              {ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Follow up on (only used for Follow up)</span>
            <input type="date" name="follow_up_date" defaultValue={lead.follow_up_date ?? ""} />
          </label>

          <label className="field">
            <span>Assigned to</span>
            <select name="assigned_to" defaultValue={lead.assigned_to}>
              {people.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Club page link</span>
            <input type="text" name="club_page_url" defaultValue={lead.club_page_url ?? ""}
              autoCapitalize="none" />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea name="notes" defaultValue={lead.notes ?? ""} />
          </label>

          <button className="btn btn-block" type="submit">
            Save changes
          </button>
        </form>

        <p className="section-rule">Danger zone</p>
        <form action={deleteLead}>
          <input type="hidden" name="id" value={lead.id} />
          <button className="btn btn-dead" type="submit">
            Delete this lead
          </button>
        </form>

        <p style={{ marginTop: 24 }}>
          <Link className="btn" href="/pipeline">
            Back to pipeline
          </Link>
        </p>
      </main>
      <Nav active="pipeline" />
    </>
  );
}
