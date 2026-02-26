import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ContestantCard from "./ContestantCard";
import { getContestantPhoto } from "@/lib/photos";
import PhoneVerification from "./PhoneVerification";
import { Crown, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contestant {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  tagline: string | null;
  category: "miss" | "master";
}

interface VoteSectionProps {
  sectionRef: React.RefObject<HTMLDivElement>;
}

const VotingSection = ({ sectionRef }: VoteSectionProps) => {
  const [activeTab, setActiveTab] = useState<"miss" | "master">("miss");
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [selectedMiss, setSelectedMiss] = useState<string | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [votingOpen, setVotingOpen] = useState(true);
  const [votedCategories, setVotedCategories] = useState<{ miss: boolean; master: boolean }>({
    miss: false,
    master: false,
  });
  const { toast } = useToast();

  // Subscribe to real-time contestant updates
  useEffect(() => {
    fetchContestants();
    fetchResults();
    checkVotingStatus();

    // Set up real-time subscription for contestants table
    // This ensures new contestants added by admins appear immediately
    const subscription = supabase
      .channel('contestants-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'contestants',
        },
        (payload) => {
          // Refetch contestants whenever the table changes
          fetchContestants();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect to poll for vote updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResults();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Check if voting is currently active
  const checkVotingStatus = async () => {
    const { data } = await supabase
      .from("voting_sessions")
      .select("id")
      .eq("is_active", true)
      .limit(1);
    setVotingOpen(!!data && data.length > 0);
  };

  // Subscribe to voting session status changes
  useEffect(() => {
    const subscription = supabase
      .channel('voting-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voting_sessions',
        },
        () => {
          // Recheck voting status when sessions change
          checkVotingStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all contestants from the database
  const fetchContestants = async () => {
    const { data } = await supabase
      .from("contestants")
      .select("*")
      .order("name");
    if (data) setContestants(data as Contestant[]);
  };

  // Fetch current vote counts for all contestants
  const fetchResults = async () => {
    const { data } = await supabase.functions.invoke("vote", {
      body: { action: "get_results" },
    });
    if (data?.results) setVoteCounts(data.results);
  };

  // Get the currently selected contestant for the active category
  const currentSelection = activeTab === "miss" ? selectedMiss : selectedMaster;
  // Check if user has already voted in the current category
  const hasVotedCurrent = activeTab === "miss" ? votedCategories.miss : votedCategories.master;

  const handleSelect = (id: string) => {
    if (hasVotedCurrent) return;
    if (activeTab === "miss") {
      setSelectedMiss(id === selectedMiss ? null : id);
    } else {
      setSelectedMaster(id === selectedMaster ? null : id);
    }
  };

  const handleProceedToVote = () => {
    const selection = activeTab === "miss" ? selectedMiss : selectedMaster;
    if (!selection) {
      toast({
        title: "No contestant selected",
        description: `Please select a contestant in the ${activeTab} category first.`,
        variant: "destructive",
      });
      return;
    }
    setShowVerification(true);
  };

  const handleVoteSuccess = (phone: string) => {
    setShowVerification(false);
    if (activeTab === "miss") {
      setVotedCategories((p) => ({ ...p, miss: true }));
    } else {
      setVotedCategories((p) => ({ ...p, master: true }));
    }
    fetchResults();

    // Check if they can still vote in the other category
    supabase.functions
      .invoke("vote", {
        body: { action: "check_vote_status", phone_number: phone },
      })
      .then(({ data }) => {
        if (data) {
          setVotedCategories({
            miss: data.voted_miss,
            master: data.voted_master,
          });
        }
      });
  };

  // Filter contestants by the currently active category (miss or master)
  const filtered = contestants.filter((c) => c.category === activeTab);

  return (
    <section ref={sectionRef} className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Choose Your <span className="text-gradient-gold">Champion</span>
        </h2>
        <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
          Select one contestant per category. Verify your identity to cast your
          vote.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-muted rounded-full p-1.5 gap-1">
          <button
            onClick={() => setActiveTab("miss")}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-body font-semibold text-sm transition-all duration-300 ${
              activeTab === "miss"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Crown className="w-4 h-4" />
            Miss YIBS
            {votedCategories.miss && (
              <span className="ml-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                Voted ✓
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("master")}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-body font-semibold text-sm transition-all duration-300 ${
              activeTab === "master"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Master YIBS
            {votedCategories.master && (
              <span className="ml-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                Voted ✓
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contestants Grid - displays all contestants in the active category */}
      {filtered.length === 0 ? (
          <div className="text-center py-20">
          <Crown className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-body text-lg">
            No contestants registered yet in the {activeTab} category. Check back soon!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ContestantCard
                  id={c.id}
                  name={c.name}
                  photoUrl={getContestantPhoto(c.name, c.photo_url)}
                  bio={c.bio || undefined}
                  tagline={c.tagline || undefined}
                  voteCount={voteCounts[c.id] || 0}
                  isSelected={currentSelection === c.id}
                  onSelect={handleSelect}
                  disabled={hasVotedCurrent}
                />
              </div>
            ))}
          </div>

          {/* Vote Button */}
          {!votingOpen ? (
            <div className="text-center bg-muted rounded-2xl p-6">
              <p className="font-display text-xl font-bold text-muted-foreground">
                🔒 Voting is currently closed
              </p>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Please check back later when voting opens.
              </p>
            </div>
          ) : !hasVotedCurrent ? (
            <div className="text-center">
              <button
                onClick={handleProceedToVote}
                disabled={!currentSelection}
                className={`inline-flex items-center gap-3 font-body font-bold text-lg px-12 py-4 rounded-full transition-all duration-300 ${
                  currentSelection
                    ? "bg-secondary text-secondary-foreground shadow-gold hover:scale-105"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Confirm & Verify Identity
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Phone Verification Modal */}
      {showVerification && (
        <PhoneVerification
          contestantId={currentSelection!}
          category={activeTab}
          onSuccess={handleVoteSuccess}
          onClose={() => setShowVerification(false)}
        />
      )}
    </section>
  );
};

export default VotingSection;
