"use server";

import { createClient } from "@/lib/supabase/server";

function assertYear(year: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Invalid year");
  }
}

export async function getForm101SignedUrlByPath(
  workerId: string,
  year: number
) {
  assertYear(year);

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  // ✅ Admin only (אם יש לך roles)
  const { data: me, error: meErr } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (meErr || !me || me.role !== "admin") {
    throw new Error("Not authorized");
  }

  // ✅ הנתיב הידוע מראש
  const filePath = `${year}/${workerId}/form101.pdf`;

  const { data, error } = await supabase.storage
    .from("forms101")
    .createSignedUrl(filePath, 60 * 5);

  if (error) {
    // לרוב זה יקרה אם אין קובץ בנתיב הזה
    return { ok: false as const, message: "לא נמצא טופס לשנה ולעובד שנבחרו." };
  }

  return { ok: true as const, url: data.signedUrl, filePath };
}

export async function getForm101SignedUrlByFullPath(filePath: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  // ✅ Admin only (אם יש לך roles)
  const { data: me, error: meErr } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (meErr || !me || me.role !== "admin") {
    throw new Error("Not authorized");
  }

  // ✅ הנתיב הידוע מראש

  const { data, error } = await supabase.storage
    .from("forms101")
    .createSignedUrl(filePath, 60 * 5);

  if (error) {
    // לרוב זה יקרה אם אין קובץ בנתיב הזה
    return { ok: false as const, message: "לא נמצא טופס בנתיב שנשלח." };
  }

  return { ok: true as const, url: data.signedUrl, filePath };
}
