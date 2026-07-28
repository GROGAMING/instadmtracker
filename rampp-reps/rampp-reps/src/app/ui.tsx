import Link from "next/link";
import {
  COLD_AFTER_DAYS,
  daysBetween,
  dueLabel,
  STATUS_LABEL,
  type Lead,
  type Profile,
} from "@/lib/types";
import { setStatus, switchWho, snooze } from "./actions";

export function Masthead({ stamp }: { stamp: string }) {
  return (
    <header className="masthead">
      <h1 className="wordmark">
        Rampp <span>/ Reps</span>
      </h1>
      <form action={switchWho}>
        <button className="signout" type="submit">
          {stamp} · Switch
        </button>
      </form>
    </header>
  );
}

export function Nav({ active }: { active: "today" | "add" | "pipeline" }) {
  const tabs = [
    { key: "today", href: "/", label: "Today" },
    { key: "add", href: "/add", label: "Add" },
    { key: "pipeline", href: "/pipeline", label: "Pipeline" },
  ] as const;

  return (
    <nav className="nav">
      {tabs.map((t) => (
        <Link key={t.key} href={t.href} aria-current={active === t.key ? "page" : undefined}>
          <span className="pip" />
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function isCold(lead: Lead): boolean {
  if (lead.status !== "sent" || !lead.sent_at) return false;
  return Date.now() - Date.parse(lead.sent_at) > COLD_AFTER_DAYS * 86_400_000;
}

function heat(lead: Lead, ref: string) {
  if (lead.status === "link_sent") return "link";
  if (lead.status === "closed") return "dead";
  if (isCold(lead)) return "cold";
  if (lead.status === "follow_up" && lead.follow_up_date) {
    const d = daysBetween(ref, lead.follow_up_date);
    if (d < 0) return "late";
    if (d === 0) return "due";
  }
  return "soon";
}

export function Docket({
  lead,
  refDate,
  owner,
  variant = "full",
}: {
  lead: Lead;
  refDate: string;
  owner?: Profile;
  variant?: "full" | "compact";
}) {
  const meta = [
    `@${lead.instagram_handle}`,
    lead.club,
    lead.county,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="docket" data-heat={heat(lead, refDate)}>
      <div className="docket-head">
        <div>
          <h2 className="docket-name">
            {lead.player_name}
            {lead.is_intercounty && <span className="county">Inter-county</span>}
          </h2>
          <p className="docket-club">{meta}</p>
          {owner && <span className="owner">{owner.name}</span>}
        </div>
        <div className="docket-due">
          {lead.status === "follow_up"
            ? dueLabel(lead.follow_up_date, refDate)
            : isCold(lead)
              ? "Cold"
              : STATUS_LABEL[lead.status]}
        </div>
      </div>

      {lead.notes && <p className="docket-note">{lead.notes}</p>}

      <div className="docket-actions">
        <a
          className="btn btn-dm"
          href={`https://ig.me/m/${lead.instagram_handle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open DM
        </a>

        {variant === "full" && lead.status === "not_messaged" && (
          <StatusButton id={lead.id} status="sent" label="Mark sent" />
        )}

        {variant === "full" && (lead.status === "sent" || lead.status === "follow_up") && (
          <>
            {[3, 7, 14].map((d) => (
              <form key={d} action={snooze}>
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="days" value={d} />
                <button className="btn" type="submit">
                  +{d}d
                </button>
              </form>
            ))}
            <StatusButton id={lead.id} status="link_sent" label="Link sent" className="btn-won" />
          </>
        )}

        {variant === "full" && lead.status !== "closed" && (
          <StatusButton id={lead.id} status="closed" label="Close" className="btn-dead" />
        )}

        {variant === "full" && lead.status === "closed" && (
          <StatusButton id={lead.id} status="not_messaged" label="Reopen" />
        )}

        <Link className="btn" href={`/lead/${lead.id}`}>
          Edit
        </Link>
      </div>
    </article>
  );
}

function StatusButton({
  id,
  status,
  label,
  className = "",
}: {
  id: string;
  status: string;
  label: string;
  className?: string;
}) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn ${className}`} type="submit">
        {label}
      </button>
    </form>
  );
}
