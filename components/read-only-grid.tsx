"use client";

import * as React from "react";
import { getBlockImageUrl } from "@/lib/block-image-map";
import Image from "next/image";
import { Package, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBuildUrl } from "@/lib/build-encoding";
import { useRouter } from "next/navigation";
import type { Material } from "@/app/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { MaterialGrid } from "./material-grid";

export function ReadOnlyGrid({
  materials,
  name,
}: {
  materials: Material[];
  name?: string;
}) {
  const [buildName, setBuildName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const [shareSuccess, setShareSuccess] = React.useState(false);

  const handleShare = () => {
    const build = {
      name: name || `Material List - ${new Date().toLocaleDateString()}`,
      materials,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const url = createBuildUrl(build);
    const fullUrl = window.location.origin + url;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  if (!materials || materials.length === 0) {
    return null;
  }

  const handleSaveBuild = async () => {
    if (!buildName.trim()) {
      setError("Build name cannot be empty");
      return;
    }

    if (materials.length === 0) {
      setError("No materials to save");
      return;
    }

    try {
      const build = {
        name: buildName.trim(),
        materials,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save to Dexie for local storage
      await db.builds.add(build);

      // Navigate to URL-encoded build (shareable, SSR-compatible)
      const url = createBuildUrl(build);
      setBuildName("");
      setError(null);

      router.push(url);
    } catch (err) {
      setError("Failed to save build");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <MaterialGrid
        materials={materials}
        handleShare={handleShare}
        shareSuccess={shareSuccess}
      />

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" className="mt-4 self-end">
            Save Build
            <Save />
          </Button>
        </DialogTrigger>
        <DialogContent className="font-minecraft">
          <DialogHeader>
            <DialogTitle>Save Build</DialogTitle>
            <DialogDescription>
              Enter a name for your build to save it for later.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel>Build Name</FieldLabel>
            <FieldContent>
              <Input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="My Awesome Build"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveBuild();
                  }
                }}
                autoFocus
              />
              {error && <FieldError>{error}</FieldError>}
            </FieldContent>
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveBuild}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
