import { Generator } from "../components/generator";

export type { Material } from "../components/generator";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-20">
      <Generator />
    </div>
  );
}
