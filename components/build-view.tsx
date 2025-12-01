"use client";

import { MaterialGrid } from "./material-grid";
import type { Build } from "@/lib/db";
import { useState } from "react";
import { createBuildUrl } from "@/lib/build-encoding";

export function BuildView({ build }: { build: Omit<Build, "id"> }) {
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = () => {
    const url = createBuildUrl(build);
    const fullUrl = window.location.origin + url;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">{build.name}</h1>
      <div className="text-sm text-muted-foreground">
        Created {new Date(build.createdAt).toLocaleDateString()}
        {build.updatedAt !== build.createdAt && (
          <> • Updated {new Date(build.updatedAt).toLocaleDateString()}</>
        )}
      </div>
      <div>
        <MaterialGrid
          materials={build.materials}
          handleShare={handleShare}
          shareSuccess={shareSuccess}
        />
      </div>
    </div>
  );
}
