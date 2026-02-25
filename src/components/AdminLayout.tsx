import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.png";
import {
  Users,
  BarChart3,
  Settings,
  LogOut,
  Crown,
  Home,
  Loader2,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Contestants", url: "/admin/contestants", icon: Crown },
  { title: "Sessions", url: "/admin/sessions", icon: Settings },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <img src={logo} alt="YIBS" className="w-10 h-10" />
          <div>
            <h2 className="font-display text-lg font-bold text-card-foreground leading-tight">
              YIBS Admin
            </h2>
            <p className="text-muted-foreground font-body text-xs">2026 Contest</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                end
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                activeClassName=""
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            activeClassName=""
          >
            <Home className="w-5 h-5" />
            Back to Site
          </NavLink>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <p className="text-muted-foreground font-body text-xs px-4 truncate">
            {user.email}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
