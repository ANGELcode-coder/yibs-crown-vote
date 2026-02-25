import miss1 from "@/assets/miss-1.jpg";
import miss2 from "@/assets/miss-2.jpg";
import miss3 from "@/assets/miss-3.jpg";
import master1 from "@/assets/master-1.jpg";
import master2 from "@/assets/master-2.jpg";
import master3 from "@/assets/master-3.jpg";

// Map contestant names to local photos
const photoMap: Record<string, string> = {
  "Aïcha Mbongo": miss1,
  "Sandrine Fotso": miss2,
  "Clarisse Nguemé": miss3,
  "Thierry Ndongo": master1,
  "Kevin Mbouda": master2,
  "Patrick Essama": master3,
};

export const getContestantPhoto = (name: string, fallback?: string | null): string => {
  return photoMap[name] || fallback || "/placeholder.svg";
};
