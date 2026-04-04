import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Home, LogOut, Search, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys, authKeys, publicKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useLogoutMutation } from '@/services/auth/queries';
import { getInitials } from '@/lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const { auth, user, isAuthenticated, clearSession } = useAuthManager();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(
      { refreshToken: auth.refreshToken },
      {
        onSettled: () => {
          clearSession();
          queryClient.clear();
          navigate(publicKeys.home.path);
        },
      }
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to={publicKeys.home.path} className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          HouseHunt
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            to={publicKeys.search.path}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            Browse
          </Link>
          {isAuthenticated && user?.role === 'LANDLORD' ? (
            <Link
              to={dashboardKeys.landlord.create.path}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              List Property
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <button className="rounded-lg p-2 transition-colors hover:bg-muted">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="hidden text-sm font-medium md:block">{user.firstName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {open ? (
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-background p-1 shadow-lg">
                    <Link
                      to={user.role === 'LANDLORD' ? dashboardKeys.landlord.home.path : dashboardKeys.tenant.home.path}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(authKeys.login.path)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate(authKeys.register.path)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
