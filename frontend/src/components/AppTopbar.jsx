import { Layers, LogOut } from 'lucide-react';

const ROLE_STYLES = {
  student: {
    accent: 'from-blue-600 to-indigo-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    avatar: 'bg-blue-600',
  },
  funder: {
    accent: 'from-violet-600 to-fuchsia-600',
    badge: 'bg-violet-50 text-violet-700 border-violet-100',
    avatar: 'bg-violet-600',
  },
  admin: {
    accent: 'from-slate-800 to-indigo-700',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    avatar: 'bg-slate-800',
  },
};

export default function AppTopbar({ role = 'student', user, onLogout, children }) {
  const style = ROLE_STYLES[role] || ROLE_STYLES.student;
  const name = user?.full_name || role;
  const firstName = name.split(' ')[0];

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`brand-mark bg-gradient-to-br ${style.accent}`}>
            <Layers size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-bold text-slate-950 sm:text-lg">VidyaFund AI</span>
              <span className={`hidden rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize sm:inline-flex ${style.badge}`}>
                {role}
              </span>
            </div>
            <p className="hidden text-xs font-medium text-slate-500 sm:block">Verified education funding platform</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {children}
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm sm:flex">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${style.avatar}`}>
              {name.charAt(0)}
            </div>
            <span className="max-w-28 truncate text-sm font-semibold text-slate-700">{firstName}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="icon-action text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
