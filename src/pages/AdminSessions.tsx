import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Plus, Trash2, Loader2, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VotingSession {
  id: string;
  name: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const AdminSessions = () => {
  const [sessions, setSessions] = useState<VotingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("voting_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSessions(data as VotingSession[]);
    setLoading(false);
  };

  const toggleActive = async (session: VotingSession) => {
    // If activating, deactivate all others first
    if (!session.is_active) {
      await supabase.from("voting_sessions").update({ is_active: false }).neq("id", session.id);
    }

    const { error } = await supabase
      .from("voting_sessions")
      .update({ is_active: !session.is_active })
      .eq("id", session.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: session.is_active ? "Voting Paused" : "Voting Activated",
        description: session.is_active
          ? `${session.name} is now paused`
          : `${session.name} is now live`,
      });
      fetchSessions();
    }
  };

  const createSession = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("voting_sessions").insert({ name: newName.trim() });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session created!" });
      setShowForm(false);
      setNewName("");
      fetchSessions();
    }
  };

  const deleteSession = async (id: string, name: string) => {
    if (!confirm(`Delete session "${name}"?`)) return;
    const { error } = await supabase.from("voting_sessions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session deleted" });
      fetchSessions();
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Voting Sessions</h1>
          <p className="text-muted-foreground font-body mt-1">
            Control when voting is open or closed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <Settings className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-body text-lg">No voting sessions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`bg-card rounded-2xl p-6 shadow-card border transition-all ${
                s.is_active ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      s.is_active ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
                    }`}
                  />
                  <div>
                    <h3 className="font-display text-lg font-bold text-card-foreground">{s.name}</h3>
                    <p className="text-muted-foreground font-body text-sm">
                      Created {new Date(s.created_at).toLocaleDateString()}
                      {s.is_active && (
                        <span className="ml-2 text-primary font-semibold">• LIVE</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-body font-semibold text-sm transition-all ${
                      s.is_active
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {s.is_active ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteSession(s.id, s.name)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl font-bold text-card-foreground mb-6">New Voting Session</h3>
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-card-foreground mb-1 block">Session Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Miss & Master YIBS 2026 - Round 2"
                />
              </div>
              <button
                onClick={createSession}
                disabled={saving || !newName.trim()}
                className="w-full bg-primary text-primary-foreground font-body font-bold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
