"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sb, whoAmI, WHO_COOKIE } from "@/lib/supabase-server";
import { addDays, cleanHandle, COLD_AFTER_DAYS, today } from "@/lib/types";

function refresh() {
  revalidatePath("/");
  revalidatePath("/pipeline");
}

export async function chooseWho(form: FormData) {
  const jar = await cookies();
  jar.set(WHO_COOKIE, String(form.get("id")), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/");
}

export async function switchWho() {
  const jar = await cookies();
  jar.delete(WHO_COOKIE);
  redirect("/who");
}

export async function addLead(_prev: string | null, form: FormData) {
  const me = await whoAmI();
  if (!me) redirect("/who");

  const player_name = String(form.get("player_name") ?? "").trim();
  const handle = cleanHandle(String(form.get("instagram_handle") ?? ""));
  const status = String(form.get("status") ?? "not_messaged");
  const follow_up_date = String(form.get("follow_up_date") ?? "") || null;

  if (!player_name) return "Add the player's name.";
  if (!handle) return "Add their Instagram handle.";
  if (status === "follow_up" && !follow_up_date) return "Pick a date for the follow-up.";

  const { error } = await sb().from("leads").insert({
    player_name,
    instagram_handle: handle,
    club: String(form.get("club") ?? "").trim() || null,
    county: String(form.get("county") ?? "").trim() || null,
    is_intercounty: form.get("is_intercounty") === "on",
    status,
    follow_up_date: status === "follow_up" ? follow_up_date : null,
    assigned_to: String(form.get("assigned_to") || me),
    created_by: me,
    notes: String(form.get("notes") ?? "").trim() || null,
    club_page_url: String(form.get("club_page_url") ?? "").trim() || null,
  });

  if (error) return `Could not save: ${error.message}`;
  refresh();
  redirect("/pipeline?status=not_messaged");
}

/** One tap from the Today screen: message sent, come back in `days`. */
export async function snooze(form: FormData) {
  await sb().from("leads").update({
    status: "follow_up",
    follow_up_date: addDays(today(), Number(form.get("days") ?? 3)),
  }).eq("id", String(form.get("id")));
  refresh();
}

export async function setStatus(form: FormData) {
  const status = String(form.get("status"));
  await sb().from("leads").update({
    status,
    follow_up_date: status === "follow_up" ? addDays(today(), 3) : null,
  }).eq("id", String(form.get("id")));
  refresh();
}

/** Bulk-closes every Sent lead that has gone quiet past the cold threshold. */
export async function closeColdLeads() {
  const cutoff = new Date(Date.now() - COLD_AFTER_DAYS * 86_400_000).toISOString();
  await sb().from("leads")
    .update({ status: "closed", follow_up_date: null })
    .eq("status", "sent").lt("sent_at", cutoff);
  refresh();
}

export async function updateLead(form: FormData) {
  const status = String(form.get("status"));
  const follow_up_date = String(form.get("follow_up_date") ?? "") || null;

  await sb().from("leads").update({
    player_name: String(form.get("player_name") ?? "").trim(),
    instagram_handle: cleanHandle(String(form.get("instagram_handle") ?? "")),
    club: String(form.get("club") ?? "").trim() || null,
    county: String(form.get("county") ?? "").trim() || null,
    is_intercounty: form.get("is_intercounty") === "on",
    status,
    follow_up_date: status === "follow_up" ? follow_up_date || addDays(today(), 3) : null,
    assigned_to: String(form.get("assigned_to")),
    notes: String(form.get("notes") ?? "").trim() || null,
    club_page_url: String(form.get("club_page_url") ?? "").trim() || null,
  }).eq("id", String(form.get("id")));

  refresh();
  redirect("/pipeline");
}

export async function deleteLead(form: FormData) {
  await sb().from("leads").delete().eq("id", String(form.get("id")));
  refresh();
  redirect("/pipeline");
}
