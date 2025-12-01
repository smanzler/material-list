import type { Metadata } from "next";
import { Generator } from "../components/generator";

export type { Material } from "../components/generator";

export const metadata: Metadata = {
  title: "Generator",
  description:
    "Generate a visual material list for your Minecraft builds. Input your materials and see them displayed with images, quantities, and stack counts.",
  openGraph: {
    title: "Minecraft Material List Generator - Generator",
    description:
      "Generate a visual material list for your Minecraft builds. Input your materials and see them displayed with images, quantities, and stack counts.",
  },
  twitter: {
    title: "Minecraft Material List Generator - Generator",
    description:
      "Generate a visual material list for your Minecraft builds. Input your materials and see them displayed with images, quantities, and stack counts.",
  },
};

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-20">
      <Generator />
    </div>
  );
}
