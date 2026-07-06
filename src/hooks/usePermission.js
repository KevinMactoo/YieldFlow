import { useAuth } from '../context/AuthContext'
import { can } from '../lib/permissions'

/**
 * Returns a helper bound to the current user's role.
 *
 * Usage:
 *   const { can } = usePermission()
 *   if (can('sales:add')) { ... }
 *
 * Or check a single action inline:
 *   const canAddSale = usePermission('sales:add')
 *
 * @param {string} [action] - optional single action to evaluate immediately
 * @returns {boolean | { can: (action: string) => boolean }}
 */
export function usePermission(action) {
  const { user } = useAuth()
  const role = user?.role ?? null

  if (action !== undefined) {
    return can(role, action)
  }

  return {
    can: (a) => can(role, a),
    role,
  }
}
