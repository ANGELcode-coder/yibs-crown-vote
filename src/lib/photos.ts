import fonkem_randy from "@/assets/fonkem_randy.jpg";
import maloh_marlvine from "@/assets/maloh_marlvine.jpg";
import mambo_annabel from "@/assets/mambo_annabel.jpg";
import vanella from "@/assets/vanella.jpg";
import ayamba_marilyn from "@/assets/ayamba_marilyn.jpg";
import kenne_ange from "@/assets/kenne_ange.jpg";
import djenou_jason from "@/assets/djenou_jason.jpg";
import arrey_delma from "@/assets/arrey_delma.jpg";
import enow_che from "@/assets/enow_che.jpg";
import mekinda_esther from "@/assets/mekinda_esther.jpg";
import metala_justin from "@/assets/metala_justin.jpg";
import essola_bingono_staicy from "@/assets/essola_bingono_staicy.jpg";
import zeal_nyuymengka from "@/assets/zeal_nyuymengka.jpg";

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
