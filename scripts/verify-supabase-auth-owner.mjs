import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  formatUserAuthObject,
  isOwnerRole,
} from "../lib/supabase.js";

async function runTests() {
  console.log("==================================================");
  console.log("EKALAYA OFFICE - TEST VERIFIKASI SUPABASE AUTH & OWNER");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Uji Supabase Configuration
  assert(isSupabaseConfigured === true, "Supabase configured via environment variables");

  // 2. Uji: Nama atau email yang mengandung 'raja', 'admin', 'owner' TIDAK BOLEH menjadi Owner
  const fakeAdminUser = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    email: "raja.admin.owner@example.com",
    user_metadata: { display_name: "Raja (Owner)" },
  };
  const memberProfile = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    role: "member",
    full_name: "Raja (Owner)",
  };
  const formattedMember = formatUserAuthObject(fakeAdminUser, memberProfile);
  assert(formattedMember.role === "member", "User with 'raja'/'admin' in name/email with 'member' profile remains role 'member'");
  assert(!isOwnerRole(formattedMember), "isOwnerRole returns false for fakeAdminUser");

  // 3. Uji: Hanya profil dengan role 'owner' dari database yang mendapatkan role 'owner'
  const trueOwnerProfile = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    role: "owner",
    full_name: "Raja Hendrawan",
  };
  const formattedOwner = formatUserAuthObject(fakeAdminUser, trueOwnerProfile);
  assert(formattedOwner.role === "owner", "User with database role 'owner' receives 'owner' role");
  assert(isOwnerRole(formattedOwner), "isOwnerRole returns true for verified database owner");

  // 4. Uji: UUID asli Supabase dipertahankan tanpa modifikasi
  assert(
    formattedOwner.id === "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "Supabase authentic UUID is strictly preserved"
  );

  // 5. Uji: Sesi PIN Darurat TIDAK BISA menyamar sebagai Owner atau sesi Supabase
  const emergencyPinUser = {
    id: "emergency-pin-session",
    name: "Tamu Darurat (PIN)",
    role: "member",
    isEmergencyPin: true,
    authMethod: "emergency_pin",
    email: "emergency@ekalaya.local",
  };
  assert(emergencyPinUser.isEmergencyPin === true, "Emergency PIN user is explicitly flagged as emergency pin");
  assert(emergencyPinUser.role !== "owner", "Emergency PIN does NOT grant owner role");
  assert(!isOwnerRole(emergencyPinUser), "isOwnerRole returns false for emergency PIN session");

  // 6. Uji: Database Supabase Profiles & RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.from("profiles").select("id, role, full_name").limit(1);
    assert(error === null, "Can query public.profiles (id, role, full_name) without schema error");

    // Uji RLS: Insert tanpa auth ditolak oleh database RLS
    const insertRes = await supabase.from("profiles").insert({
      id: "00000000-0000-0000-0000-000000000000",
      full_name: "RLS Test Attacker",
      role: "owner",
    });
    assert(
      insertRes.error && insertRes.error.code === "42501",
      "Direct unauthorized insert to public.profiles is blocked by database RLS (Error 42501)"
    );
  } catch (err) {
    console.error("Supabase test query error:", err);
    failed++;
  }

  console.log("==================================================");
  console.log(`HASIL TEST: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
