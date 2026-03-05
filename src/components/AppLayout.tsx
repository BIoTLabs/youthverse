import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Briefcase, TreePine, Wallet, Shield, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { YouthWorksLogo } from '@/components/YouthWorksLogo';

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
  const { theme, toggle } = useTheme();
  const isAdmin = roles.includes('admin') || roles.includes('national_admin');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <YouthWorksLogo size="sm" />
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <NavLink
                to="/admin"
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  location.pathname === '/admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </NavLink>
            )}
            <button
              onClick={toggle}
              className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <NavLink
              to="/profile"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{profile?.full_name || 'Profile'}</span>
            </NavLink>
            <button
              onClick={signOut}
              className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-5 pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl safe-area-bottom">
        <div className="container flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-semibold transition-all",
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
