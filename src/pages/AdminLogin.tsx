import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const { user, isAdmin, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (user && !isAdmin) {
    const handleClaimAdmin = async () => {
      setSubmitting(true);
      const { data, error } = await supabase.functions.invoke("admin", {
        body: { action: "make_first_admin", user_id: user.id },
      });
      setSubmitting(false);
      if (error || data?.error) {
        toast({
          title: "Cannot grant admin",
          description: data?.error || "An admin already exists.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Admin access granted!", description: "Reloading..." });
        setTimeout(() => window.location.reload(), 1000);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full text-center">
          <img src={logo} alt="YIBS" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-card-foreground mb-2">Admin Setup</h2>
          <p className="text-muted-foreground font-body mb-6">
            No admin has been set up yet. Claim admin access or contact the existing administrator.
          </p>
          <p className="text-muted-foreground font-body text-sm mb-4">
            Logged in as: {user.email}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleClaimAdmin}
              disabled={submitting}
              className="bg-secondary text-secondary-foreground font-body font-semibold px-6 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Claim Admin Access
            </button>
            <button
              onClick={signOut}
              className="bg-muted text-muted-foreground font-body font-semibold px-6 py-2 rounded-xl hover:bg-muted/80"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      toast({
        title: "Authentication Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (isSignUp) {
      toast({
        title: "Account Created",
        description: "Account created. An admin must grant you admin privileges.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <img src={logo} alt="YIBS" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-card-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Miss & Master YIBS 2026
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-sm font-medium text-card-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yibs.cm"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-card-foreground mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-body font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-muted-foreground font-body text-sm mt-6">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-semibold hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
