"use client";

import { MaterialGrid } from "./material-grid";
import type { Build } from "@/lib/db";
import { useState } from "react";
import { createBuildUrl } from "@/lib/build-encoding";
import { Button } from "./ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

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
    <div className="flex flex-col gap-4 p-8 md:p-20 max-w-4xl mx-auto">
      <Button
        className="w-fit mb-4"
        type="button"
        variant="link"
        size="sm"
        asChild
      >
        <Link href="/builds">
          <ArrowLeft />
          Back to Builds
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{build.name}</h1>

        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href="/">
            <Plus />
            Create New Build
          </Link>
        </Button>
      </div>
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
