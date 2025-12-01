"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { MaterialGrid } from "./material-grid";

export function BuildView({ id }: { id: string }) {
  const build = useLiveQuery(() => db.builds.get(Number(id)));

  if (build === undefined) {
    return <div>Loading...</div>;
  }

  if (build === null) {
    return <div>Build not found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1>{build.name}</h1>
      <MaterialGrid materials={build.materials} />
    </div>
  );
}
