import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Sprout, Beef, Bird, CheckSquare,
  BookOpen, HeartPulse, ShoppingCart, Wallet, BarChart3,
  LogOut, Leaf,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/crops',    icon: Sprout,          label: 'Crops'       },
  { to: '/livestock',icon: Beef,            label: 'Livestock'   },
  { to: '/flocks',   icon: Bird,            label: 'Flocks'      },
  { to: '/tasks',    icon: CheckSquare,     label: 'Tasks'       },
  { to: '/daily-logs',icon: BookOpen,       label: 'Daily Logs'  },
  { to: '/health',   icon: HeartPulse,      label: 'Health'      },
  { to: '/sales',    icon: ShoppingCart,    label: 'Sales'       },
  { to: '/finances', icon: Wallet,          label: 'Finances'    },
  { to: '/reports',  icon: BarChart3,       label: 'Reports'     },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">YieldFlow</span>
        </div>

        {/* Farm name */}
        {user && (
          <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
            <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Farm</p>
            <p className="text-sm font-semibold text-primary-800">{user.farm}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / logout */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
