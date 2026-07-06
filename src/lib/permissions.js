// ─── Role definitions ─────────────────────────────────────────────────────────
//
// owner      — full access to everything including user management
// manager    — full farm operations, no user management, read-only finances
// accountant — read-only farm ops, full access to finances/sales/reports
// farmer     — read-only everything except daily logs and tasks (can add/edit own)
//
// Permission matrix keys map directly to actions used via usePermission(action).

export const ROLES = {
  OWNER:       'owner',
  MANAGER:     'manager',
  ACCOUNTANT:  'accountant',
  FARMER:      'farmer',
}

// Role display labels and colours for UI badges
export const ROLE_META = {
  owner:      { label: 'Owner',      color: 'bg-purple-100 text-purple-700' },
  manager:    { label: 'Manager',    color: 'bg-blue-100 text-blue-700'     },
  accountant: { label: 'Accountant', color: 'bg-amber-100 text-amber-700'   },
  farmer:     { label: 'Farmer',     color: 'bg-green-100 text-green-700'   },
}

// ─── Permission matrix ────────────────────────────────────────────────────────
// Each key is an action string. Value is the set of roles that may perform it.
// Use PERMISSIONS[action].has(user.role) to check.

const allow = (...roles) => new Set(roles)
const all   = allow('owner', 'manager', 'accountant', 'farmer')
const staff = allow('owner', 'manager', 'accountant')
const ops   = allow('owner', 'manager')
const ownerOnly = allow('owner')

export const PERMISSIONS = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  'dashboard:view':           all,

  // ── Crops ──────────────────────────────────────────────────────────────────
  'crops:view':               all,
  'crops:add':                ops,
  'crops:edit':               ops,
  'crops:delete':             ops,

  // ── Livestock ──────────────────────────────────────────────────────────────
  'livestock:view':           all,
  'livestock:add':            ops,
  'livestock:edit':           ops,
  'livestock:delete':         ops,

  // ── Flocks ─────────────────────────────────────────────────────────────────
  'flocks:view':              all,
  'flocks:add':               ops,
  'flocks:edit':              ops,
  'flocks:delete':            ops,

  // ── Tasks ──────────────────────────────────────────────────────────────────
  'tasks:view':               all,
  'tasks:add':                all,          // all roles can create tasks
  'tasks:edit':               all,          // all roles can update status
  'tasks:delete':             ops,

  // ── Daily Logs ─────────────────────────────────────────────────────────────
  'logs:view':                all,
  'logs:add':                 all,          // farmers can log their own activity
  'logs:delete':              ops,

  // ── Health ─────────────────────────────────────────────────────────────────
  'health:view':              all,
  'health:add':               ops,
  'health:edit':              ops,

  // ── Sales ──────────────────────────────────────────────────────────────────
  'sales:view':               all,
  'sales:add':                staff,        // accountant can record sales
  'sales:delete':             staff,

  // ── Finances / Expenses ────────────────────────────────────────────────────
  'finances:view':            all,
  'expenses:add':             staff,
  'expenses:delete':          staff,

  // ── Reports ────────────────────────────────────────────────────────────────
  'reports:view':             all,

  // ── Egg Production ─────────────────────────────────────────────────────────
  'eggs:add':                 ops,

  // ── User management ────────────────────────────────────────────────────────
  'users:view':               ownerOnly,
  'users:invite':             ownerOnly,
  'users:change_role':        ownerOnly,
  'users:remove':             ownerOnly,
}

/**
 * Returns true if the given role is allowed to perform the action.
 * Falls back to false for unknown actions or roles.
 *
 * @param {string} role   - one of ROLES.*
 * @param {string} action - key in PERMISSIONS
 */
export function can(role, action) {
  if (!role || !action) return false
  const allowed = PERMISSIONS[action]
  if (!allowed) return false
  return allowed.has(role)
}
