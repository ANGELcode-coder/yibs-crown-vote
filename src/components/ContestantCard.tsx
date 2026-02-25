import { Crown } from "lucide-react";

interface ContestantCardProps {
  id: string;
  name: string;
  photoUrl: string;
  bio?: string;
  tagline?: string;
  voteCount: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const ContestantCard = ({
  id,
  name,
  photoUrl,
  bio,
  tagline,
  voteCount,
  isSelected,
  onSelect,
  disabled,
}: ContestantCardProps) => {
  return (
    <button
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      className={`group relative bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-300 text-left w-full ${
        isSelected
          ? "ring-4 ring-secondary scale-[1.02] shadow-gold"
          : "hover:shadow-xl hover:scale-[1.01]"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

        {isSelected && (
          <div className="absolute top-3 right-3 bg-secondary rounded-full p-2 shadow-gold animate-fade-in-up">
            <Crown className="w-5 h-5 text-secondary-foreground" />
          </div>
        )}

        {/* Vote count badge */}
        <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-primary-foreground font-body text-sm font-semibold">
            {voteCount} vote{voteCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-card-foreground mb-1">
          {name}
        </h3>
        {tagline && (
          <p className="text-secondary font-body text-sm font-medium mb-2">
            {tagline}
          </p>
        )}
        {bio && (
          <p className="text-muted-foreground font-body text-sm line-clamp-2">
            {bio}
          </p>
        )}
      </div>
    </button>
  );
};

export default ContestantCard;
