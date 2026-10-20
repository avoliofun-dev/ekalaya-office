import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project-ref")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Mengambil data profil pengguna langsung dari tabel public.profiles berdasarkan auth.uid()
 * Memastikan role diambil dari database dan bukan dari manipulasi klien.
 */
export async function fetchUserProfile(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, full_name, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil profil dari public.profiles:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Kesalahan fetchUserProfile:", err);
    return null;
  }
}

/**
 * Memastikan profil pengguna tersedia di tabel public.profiles.
 * Jika belum ada (misal registrasi baru), buat profil dengan role 'member' secara default.
 * PERINGATAN KEAMANAN: Role 'owner' TIDAK BOLEH ditetapkan di sini.
 */
export async function ensureUserProfile(user, fallbackDisplayName = "") {
  if (!isSupabaseConfigured || !supabase || !user?.id) return null;

  let profile = await fetchUserProfile(user.id);
  if (!profile) {
    const displayName =
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      fallbackDisplayName ||
      user.email?.split("@")[0] ||
      "Anggota";

    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: displayName,
          role: "member", // Default mutlak 'member'
        })
        .select("id, role, full_name, created_at, updated_at")
        .maybeSingle();

      if (!error && data) {
        profile = data;
      } else {
        // Jika trigger sudah membuat atau RLS membatasi, coba ambil ulang
        profile = await fetchUserProfile(user.id);
      }
    } catch {
      profile = await fetchUserProfile(user.id);
    }
  }

  return profile;
}

/**
 * Helper validasi peran Owner resmi (berbasis database Supabase)
 */
export function isOwnerRole(user) {
  if (!user || user.isEmergencyPin) return false;
  const role = (user.role || "").toLowerCase();
  return role === "owner";
}

/**
 * Format objek user standar untuk konsistensi state seluruh aplikasi
 */
export function formatUserAuthObject(user, profile, authMethod = "supabase") {
  const role = (profile?.role || "").toLowerCase() === "owner" ? "owner" : "member";
  return {
    id: user.id, // UUID Supabase asli
    email: user.email || "",
    name:
      profile?.full_name ||
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Anggota",
    role,
    authMethod,
    isEmergencyPin: false,
  };
}

