import Dexie, { EntityTable } from "dexie";
import type { Material } from "@/components/generator";

interface Build {
  id?: number;
  name: string;
  materials: Material[];
  collectedMaterials?: number[];
  createdAt: number;
  updatedAt: number;
}

const db = new Dexie("BuildsDatabase") as Dexie & {
  builds: EntityTable<Build, "id">;
};

db.version(1).stores({
  builds: "++id, name, materials, createdAt, updatedAt",
});

// Version 2: Add collectedMaterials field
db.version(2)
  .stores({
    builds: "++id, name, materials, collectedMaterials, createdAt, updatedAt",
  })
  .upgrade((tx) => {
    // Migrate existing builds to have empty collectedMaterials array
    return tx
      .table("builds")
      .toCollection()
      .modify((build) => {
        if (!build.collectedMaterials) {
          build.collectedMaterials = [];
        }
      });
  });

export { db, type Build };
