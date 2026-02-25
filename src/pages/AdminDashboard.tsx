import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Users, Vote, TrendingUp, BarChart3 } from "lucide-react";

interface ContestantStat {
  id: string;
  name: string;
  category: string;
  vote_count: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<ContestantStat[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalContestants, setTotalContestants] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Get contestants
    const { data: contestants } = await supabase
      .from("contestants")
      .select("*")
      .order("name");

    // Get vote counts via edge function
    const { data: voteData } = await supabase.functions.invoke("vote", {
      body: { action: "get_results" },
    });

    const counts = voteData?.results || {};
    const mapped = (contestants || []).map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      vote_count: counts[c.id] || 0,
    }));

    setStats(mapped);
    setTotalContestants(mapped.length);
    setTotalVotes(mapped.reduce((sum, c) => sum + c.vote_count, 0));

    // Estimate voters (total votes / categories voted)
    setTotalVoters(Math.ceil(mapped.reduce((sum, c) => sum + c.vote_count, 0) / 1.5));
  };

  const missContestants = stats.filter((c) => c.category === "miss").sort((a, b) => b.vote_count - a.vote_count);
  const masterContestants = stats.filter((c) => c.category === "master").sort((a, b) => b.vote_count - a.vote_count);
  const maxVotes = Math.max(...stats.map((c) => c.vote_count), 1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground font-body mt-1">
          Overview of the Miss & Master YIBS 2026 contest
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Vote className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground font-body text-sm">Total Votes</p>
              <p className="font-display text-3xl font-bold text-card-foreground">{totalVotes}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-muted-foreground font-body text-sm">Contestants</p>
              <p className="font-display text-3xl font-bold text-card-foreground">{totalContestants}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground font-body text-sm">Est. Voters</p>
              <p className="font-display text-3xl font-bold text-card-foreground">{totalVoters}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Miss Category */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-xl font-bold text-card-foreground">Miss YIBS</h2>
          </div>
          {missContestants.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No contestants yet</p>
          ) : (
            <div className="space-y-4">
              {missContestants.map((c, i) => (
                <div key={c.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-body text-sm font-medium text-card-foreground">
                      {i === 0 && c.vote_count > 0 ? "👑 " : ""}{c.name}
                    </span>
                    <span className="font-body text-sm font-semibold text-primary">
                      {c.vote_count} votes
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${(c.vote_count / maxVotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Master Category */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-xl font-bold text-card-foreground">Master YIBS</h2>
          </div>
          {masterContestants.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No contestants yet</p>
          ) : (
            <div className="space-y-4">
              {masterContestants.map((c, i) => (
                <div key={c.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-body text-sm font-medium text-card-foreground">
                      {i === 0 && c.vote_count > 0 ? "👑 " : ""}{c.name}
                    </span>
                    <span className="font-body text-sm font-semibold text-primary">
                      {c.vote_count} votes
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-700"
                      style={{ width: `${(c.vote_count / maxVotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
