// Import new contestant photos with descriptive names
import mamboAnnabelAwah from "@/assets/Mambo Annabel Awah.jpeg";
import chuhmboiVanella from "@/assets/Chuhmboin Vanella.jpeg";
import ayambaMarilyn from "@/assets/Ayamba Marilyn Ojong.jpg";
import kenneAnge from "@/assets/Kenne Ange.jpeg";
import arreyDelmaEteng from "@/assets/Arrey Delma Eteng.jpeg";
import enowChePrecious from "@/assets/Enow Che Precious.jpg";
import mekindaEsther from "@/assets/Mekinda Esther.jpeg";
import essolaBingonoStaicy from "@/assets/Essola Bingono Staicy.jpeg";
import yikoniNyuymengka from "@/assets/Yikoni Nyuymengka.jpeg";
import fonkemRandy from "@/assets/Fonkem Randy.jpg";
import malohMalvineJoy from "@/assets/Maloh Malvine-Joy.jpeg";
import djenouJason from "@/assets/Djenou Jason Muluh Afeseh.jpg";
import metalajustinAngel from "@/assets/Metala Justin Angel.jpg";

// Map contestant names to their corresponding photos
// This ensures the correct image displays for each contestant on both the voting and admin pages
const photoMap: Record<string, string> = {
  // Miss YIBS Category
  "Mambo Annabel Awah": mamboAnnabelAwah,
  "Chuhmboin Vanella": chuhmboiVanella,
  "Ayamba Marilyn Ojong": ayambaMarilyn,
  "Kenne Ange": kenneAnge,
  "Arrey Delma Eteng": arreyDelmaEteng,
  "Enow Che Precious": enowChePrecious,
  "Mekinda Esther": mekindaEsther,
  "Essola Bingono Staicy": essolaBingonoStaicy,
  "Yikoni Nyuymengka": yikoniNyuymengka,
  
  // Master YIBS Category
  "Fonkem Randy": fonkemRandy,
  "Maloh Malvine-Joy": malohMalvineJoy,
  "Djenou Jason Muluh Afeseh": djenouJason,
  "Metala Justin Angel": metalajustinAngel,
};

/**
 * Retrieves the photo URL for a contestant by their name
 * @param name - The contestant's full name
 * @param fallback - Optional fallback URL if the name is not found in the map
 * @returns The photo URL for the contestant, or a placeholder if not found
 */
export const getContestantPhoto = (name: string, fallback?: string | null): string => {
  return photoMap[name] || fallback || "/placeholder.svg";
};
