import fonkem_randy from "@/assets/fonkem_randy.jpg";
import maloh_marlvine from "@/assets/WhatsApp Image 2026-02-26 at 02.02.23 (1).jpeg";
import mambo_annabel from "@/assets/WhatsApp Image 2026-02-26 at 02.02.23.jpeg";
import vanella from "@/assets/vanella.jpg";
import ayamba_marilyn from "@/assets/WhatsApp Image 2026-02-26 at 02.02.24 (3).jpeg";
import kenne_ange from "@/assets/kenne_ange.jpg";
import djenou_jason from "@/assets/djenou_jason.jpg";
import arrey_delma from "@/assets/arrey_delma.jpg";
import enow_che from "@/assets/enow_che.jpg";
import mekinda_esther from "@/assets/WhatsApp Image 2026-02-26 at 02.02.24 (1).jpeg";
import metala_justin from "@/assets/metala_justin.jpg";
import essola_bingono_staicy from "@/assets/WhatsApp Image 2026-02-26 at 02.02.24.jpeg";
import zeal_nyuymengka from "@/assets/WhatsApp Image 2026-02-26 at 02.02.23 (2).jpeg";

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
