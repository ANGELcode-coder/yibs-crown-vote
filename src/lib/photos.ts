import fonkem_randy from "@/assets/fonkem_randy.jpg";
import maloh_marlvine from "@/assets/Maloh Malvine-Joy.jpeg";
import mambo_annabel from "@/assets/Mambo Annabel Awah.jpeg";
import vanella from "@/assets/Chuhmboin Vanella.jpeg";
import ayamba_marilyn from "@/assets/ayamba_marilyn.jpg";
import kenne_ange from "@/assets/Kenne Ange.jpeg";
import djenou_jason from "@/assets/djenou_jason.jpg";
import arrey_delma from "@/assets/Arrey Delma Eteng.jpeg";
import enow_che from "@/assets/enow_che.jpg";
import mekinda_esther from "@/assets/Mekinda Esther.jpeg";
import metala_justin from "@/assets/metala_justin.jpg";
import essola_bingono_staicy from "@/assets/Essola Bingono Staicy.jpeg";
import zeal_nyuymengka from "@/assets/Yikoni Nyuymengka.jpeg";

// Map contestant names to local photos
const photoMap: Record<string, string> = {
  "Fonkem Randy": fonkem_randy,
  "Maloh Malvine-Joy": maloh_marlvine,
  "Mambo Annabel Awah": mambo_annabel,
  "Chuhmboin Vanella": vanella,
  "Ayamba Marilyn Ojong": ayamba_marilyn,
  "Kenne Ange": kenne_ange,
  "Djenou Jason Muluh Afeseh": djenou_jason,
  "Arrey Delma Eteng": arrey_delma,
  "Enow Che Precious": enow_che,
  "Mekinda Esther": mekinda_esther,
  "Metala Justin Angel": metala_justin,
  "Essola Bingono Staicy": essola_bingono_staicy,
  "Yikoni Nyuymengka": zeal_nyuymengka,
};

export const getContestantPhoto = (name: string, fallback?: string | null): string => {
  return photoMap[name] || fallback || "/placeholder.svg";
};
