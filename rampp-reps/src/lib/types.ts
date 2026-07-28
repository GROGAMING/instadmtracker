export type Status = "not_messaged" | "sent" | "follow_up" | "link_sent" | "closed";

export type Profile = { id: string; name: string; is_active: boolean };

export type Lead = {
  id: string;
  player_name: string;
  instagram_handle: string;
  club: string | null;
  county: string | null;
  is_intercounty: boolean;
  status: Status;
  follow_up_date: string | null;
  assigned_to: string;
  created_by: string | null;
  notes: string | null;
  club_page_url: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABEL: Record<Status, string> = {
  not_messaged: "Not messaged",
  sent: "Sent",
  follow_up: "Follow up",
  link_sent: "Link sent",
  closed: "Closed",
};

/** Days of silence after which a Sent lead is treated as cold. */
export const COLD_AFTER_DAYS = 14;

export function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000,
  );
}

export function dueLabel(date: string | null, ref: string): string {
  if (!date) return "No date";
  const d = daysBetween(ref, date);
  if (d === 0) return "Today";
  if (d === -1) return "1 day late";
  if (d < 0) return `${Math.abs(d)} days late`;
  if (d === 1) return "Tomorrow";
  return `In ${d} days`;
}

export function cleanHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^@+/, "")
    .toLowerCase();
}
