import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Schema note ──────────────────────────────────────────────────────────────
//
// Supabase table required (run in SQL editor):
//
// create table public.profiles (
//   id          uuid primary key references auth.users(id) on delete cascade,
//   name        text not null,
//   farm_name   text not null default 'My Farm',
//   role        text not null default 'farmer'
//                 check (role in ('owner','manager','accountant','farmer')),
//   farm_id     uuid not null,
//   created_at  timestamptz default now()
// );
//
// -- Allow users to read/write only their own profile
// alter table public.profiles enable row level security;
// create policy "profiles: own row" on public.profiles
//   using (auth.uid() = id) with check (auth.uid() = id);
//
// -- Allow users to read profiles of people in their own farm
// create policy "profiles: same farm read" on public.profiles
//   for select using (
//     farm_id = (select farm_id from public.profiles where id = auth.uid())
//   );
//
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// Merge Supabase auth user + our profiles row into one flat object
function buildUser(authUser, profile) {
  if (!authUser) return null
  return {
    id:       authUser.id,
    email:    authUser.email,
    name:     profile?.name     ?? authUser.email,
    farm:     profile?.farm_name ?? 'My Farm',
    farmId:   profile?.farm_id  ?? null,
    role:     profile?.role     ?? 'farmer',
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)  // true until initial session check resolves

  // Fetch profile from Supabase and merge with auth user
  async function loadProfile(authUser) {
    if (!authUser) { setUser(null); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, farm_name, farm_id, role')
      .eq('id', authUser.id)
      .single()
    setUser(buildUser(authUser, profile))
  }

  // Subscribe to auth state changes (handles tab focus token refresh, sign-out, etc.)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── register ───────────────────────────────────────────────────────────────
  // Creates the Supabase Auth user + inserts a profiles row.
  // The first user to register for a farm becomes the owner; they get a new
  // farm_id UUID. Subsequent users are added via invite (see users:invite).
  const register = async (name, email, farmName, password) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },   // stored in auth.users.raw_user_meta_data
    })
    if (signUpError) return signUpError.message

    const authUser = data.user
    if (!authUser) return 'Registration failed. Please try again.'

    // Generate a new farm_id for this owner
    const farm_id = crypto.randomUUID()

    const { error: profileError } = await supabase.from('profiles').insert({
      id:        authUser.id,
      name,
      farm_name: farmName,
      farm_id,
      role:      'owner',
    })
    if (profileError) return profileError.message

    return true
  }

  // ── login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Supabase returns "Invalid login credentials" for both bad email and bad
      // password — give a friendlier message without leaking which is wrong.
      return error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message
    }
    return true
  }

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ── requestPasswordReset ───────────────────────────────────────────────────
  // Supabase sends a real reset email with a link back to /reset-password.
  const requestPasswordReset = async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) return error.message
    return true
  }

  // ── resetPassword ──────────────────────────────────────────────────────────
  // Called from ResetPassword page after the user clicks the email link.
  // Supabase sets an active session from the URL token automatically
  // (detectSessionInUrl: true), so we just update the password directly.
  const resetPassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return error.message
    return true
  }

  // ── updateProfile ──────────────────────────────────────────────────────────
  // Lets the user update their display name or farm name.
  const updateProfile = async (changes) => {
    const { error } = await supabase
      .from('profiles')
      .update(changes)
      .eq('id', user.id)
    if (error) return error.message
    setUser(prev => ({
      ...prev,
      name: changes.name     ?? prev.name,
      farm: changes.farm_name ?? prev.farm,
    }))
    return true
  }

  // ── inviteUser ─────────────────────────────────────────────────────────────
  // Owner-only: invite a new team member to the same farm with a specific role.
  // Uses Supabase Admin API via a Postgres function to avoid exposing service key.
  // Alternatively, owner can share a sign-up link with a role token.
  // Here we create an invite record the new user will consume on first login.
  const inviteUser = async (email, name, role) => {
    if (!user?.farmId) return 'No farm associated with your account.'

    // Insert a pending invite — the invited user picks it up on first login.
    const { error } = await supabase.from('invites').insert({
      email:   email.toLowerCase().trim(),
      farm_id: user.farmId,
      role,
      invited_by: user.id,
    })
    if (error) return error.message
    return true
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      inviteUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
