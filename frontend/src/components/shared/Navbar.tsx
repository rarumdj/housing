import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Bell, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getPostLoginPath } from '@/routes/keys';
import { useLogout } from '@/lib/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';

export const Navbar = () => {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          HouseHunt
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/search" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-4 h-4" /> Browse
          </Link>
          {isAuthenticated && user?.role === 'LANDLORD' && (
            <Link to="/landlord/properties/new" className="text-muted-foreground hover:text-foreground transition-colors">List Property</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Bell className="w-5 h-5" /></button>
              <div className="relative">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-background shadow-lg p-1 z-50">
                    <Link to={getPostLoginPath(user.role)} onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={() => { setOpen(false); logout.mutate(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">Sign in</button>
              <button onClick={() => navigate('/register')} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Get started</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
