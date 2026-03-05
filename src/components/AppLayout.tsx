import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Briefcase, TreePine, Wallet, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/skills', icon: BookOpen, label: 'Skills' },
  { to: '/work', icon: Briefcase, label: 'Work' },
  { to: '/green', icon: TreePine, label: 'Green' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, roles, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = roles.includes('admin') || roles.includes('national_admin');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
              <span className="text-sm font-bold text-primary-foreground">YW</span>
            </div>
            <span className="font-display text-lg font-bold text-foreground">YouthWorks</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <NavLink
                to="/admin"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  location.pathname === '/admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{profile?.full_name || 'Profile'}</span>
            </NavLink>
            <button
              onClick={signOut}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-4 pb-20">{children}</main>

      {/* Bottom navigation - mobile first */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
        <div className="container flex items-center justify-around py-1.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all",
                  isActive
                    ? 'text-primary scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
