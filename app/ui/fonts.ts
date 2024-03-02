import {
  Inter,
  Lusitana,
  Poppins,
  Roboto,
  Permanent_Marker,
} from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const lusitana = Lusitana({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const permanent_marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});
