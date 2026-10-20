import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-Side Verification Endpoint untuk Hak Akses Owner
 * Memverifikasi JWT Supabase dan memeriksa role di public.profiles.
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, isOwner: false, error: "Token otentikasi tidak disediakan." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, isOwner: false, error: "Konfigurasi Supabase server tidak ditemukan." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Validasi token langsung ke Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { success: false, isOwner: false, error: "Sesi tidak valid atau telah kedaluwarsa." },
        { status: 401 }
      );
    }

    // Ambil role resmi dari tabel public.profiles di database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, isOwner: false, error: "Profil pengguna tidak ditemukan di database." },
        { status: 403 }
      );
    }

    const isOwner = profile.role === "owner";
    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          isOwner: false,
          error: "Akses ditolak: Operasi ini memerlukan peran Platform Owner.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      isOwner: true,
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name || user.email?.split("@")[0],
        role: "owner",
      },
    });
  } catch (err) {
    console.error("Error pada /api/admin/verify:", err);
    return NextResponse.json(
      { success: false, isOwner: false, error: "Terjadi kesalahan internal saat verifikasi." },
      { status: 500 }
    );
  }
}
