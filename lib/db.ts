import Dexie, { EntityTable } from "dexie";
import type { Material } from "@/components/generator";

interface Build {
  id?: number;
  name: string;
  materials: Material[];
  createdAt: number;
  updatedAt: number;
}

const db = new Dexie("BuildsDatabase") as Dexie & {
  builds: EntityTable<Build, "id">;
};

db.version(1).stores({
  builds: "++id, name, materials, createdAt, updatedAt",
});

export { db, type Build };
