"use client";

import { useState } from "react";
import { GeneratorForm } from "./generator-form";
import { ReadOnlyGrid } from "./read-only-grid";

export interface Material {
  name: string;
  quantity: number;
}

export function Generator() {
  const [materials, setMaterials] = useState<Material[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <GeneratorForm setMaterials={setMaterials} />
      {materials.length > 0 && <ReadOnlyGrid materials={materials} />}
    </div>
  );
}
