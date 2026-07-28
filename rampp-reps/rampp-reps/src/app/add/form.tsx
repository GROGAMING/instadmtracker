"use client";

import { useActionState, useState } from "react";
import { addLead } from "../actions";
import { STATUS_LABEL, type Profile, type Status } from "@/lib/types";

function shift(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const ORDER: Status[] = ["not_messaged", "sent", "follow_up", "link_sent", "closed"];

export default function AddForm({
  people,
  meId,
  defaultDate,
}: {
  people: Profile[];
  meId: string;
  defaultDate: string;
}) {
  const [error, action, pending] = useActionState<string | null, FormData>(addLead, null);
  const [status, setStatus] = useState<Status>("not_messaged");
  const [date, setDate] = useState(shift(defaultDate, 3));

  return (
    <form action={action}>
      {error && <p className="notice">{error}</p>}

      <label className="field">
        <span>Player name</span>
        <input type="text" name="player_name" required autoComplete="off" />
      </label>

      <label className="field">
        <span>Instagram handle</span>
        <input type="text" name="instagram_handle" placeholder="@handle" required
          autoCapitalize="none" autoCorrect="off" autoComplete="off" />
      </label>

      <label className="field">
        <span>Club</span>
        <input type="text" name="club" autoComplete="off" />
      </label>

      <label className="field">
        <span>County</span>
        <input type="text" name="county" autoComplete="off" />
      </label>

      <label className="check">
        <input type="checkbox" name="is_intercounty" />
        <span>Inter-county player</span>
      </label>

      <label className="field">
        <span>Status</span>
        <select name="status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          {ORDER.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </label>

      {status === "follow_up" && (
        <div className="field">
          <span>Follow up on</span>
          <div className="chips">
            {[2, 3, 7, 14].map((d) => {
              const v = shift(defaultDate, d);
              return (
                <button key={d} type="button" className="chip" aria-current={date === v}
                  onClick={() => setDate(v)}>+{d}d</button>
              );
            })}
          </div>
          <input type="date" name="follow_up_date" value={date}
            onChange={(e) => setDate(e.target.value)} />
        </div>
      )}

      <label className="field">
        <span>Assigned to</span>
        <select name="assigned_to" defaultValue={meId}>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Club page link</span>
        <input type="text" name="club_page_url" placeholder="ramppnutrition.com/pages/…"
          autoCapitalize="none" autoComplete="off" />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea name="notes" placeholder="How you know them, what you sent, what they said…" />
      </label>

      <button className="btn btn-block" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save lead"}
      </button>
    </form>
  );
}
