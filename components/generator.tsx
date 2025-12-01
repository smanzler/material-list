"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { MaterialGrid } from "@/components/material-grid";
import { Spinner } from "@/components/ui/spinner";
import { db, type Build } from "@/lib/db";
import { Trash2, FolderOpen } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Kbd, KbdGroup } from "./ui/kbd";

export interface Material {
  name: string;
  quantity: number;
}

function parseMaterialList(materialList: string): Material[] {
  return materialList
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const quantityMatch = item.match(/\d+/);
      const quantity = quantityMatch ? parseInt(quantityMatch[0], 10) : 1;

      const name = item.replace(/\d+/g, "").replace(/[x*:]/g, "").trim();

      return {
        name: name || item,
        quantity,
      };
    });
}

export function Generator() {
  const [materialList, setMaterialList] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showBuilds, setShowBuilds] = useState(false);
  const builds = useLiveQuery(() => db.builds.toArray());
  const [isSavedBuild, setIsSavedBuild] = useState(false);
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsMac(navigator.userAgent.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);

      if (!materialList.trim()) {
        setError("Material list cannot be empty");
        return;
      }
      setIsLoading(true);

      const parsedMaterials = parseMaterialList(materialList);
      setMaterials(parsedMaterials);
      setLoadingProgress(0);
    },
    [materialList]
  );

  const handleLoadingProgress = (progress: number, isComplete: boolean) => {
    setLoadingProgress(progress);
    if (isComplete) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (isMac ? e.metaKey : e.ctrlKey) &&
        e.key === "Enter" &&
        !isLoading &&
        materialList.trim()
      ) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [materialList, isLoading, isMac, handleSubmit]);

  const handleLoadBuild = async (build: Build) => {
    if (!build.materials || build.materials.length === 0) {
      setError("Build has no materials");
      return;
    }

    const materialText = build.materials
      .map((m) => `${m.quantity} ${m.name}`)
      .join("\n");
    setMaterialList(materialText);
    setMaterials(build.materials);
    setShowBuilds(false);
    setIsSavedBuild(true);
    setError(null);
  };

  const handleDeleteBuild = async (id: number) => {
    try {
      await db.builds.delete(id);
    } catch (err) {
      setError("Failed to delete build");
      console.error(err);
    }
  };

  return (
    <div>
      <main className="max-w-4xl mx-auto p-8 md:p-20 font-minecraft">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Field>
            <FieldLabel>Material List</FieldLabel>
            <FieldContent>
              <Textarea
                value={materialList}
                onChange={(e) => setMaterialList(e.target.value)}
                placeholder="Enter your material list here (one per line or comma-separated)"
                rows={3}
                className="resize-none max-h-[120px]"
              />
              {error && <FieldError>{error}</FieldError>}
            </FieldContent>
          </Field>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner />
                  Loading images... {loadingProgress}%
                </>
              ) : (
                <>
                  Generate Visual List
                  {isMac !== undefined && (
                    <KbdGroup>
                      <Kbd className="bg-background/20 text-background dark:bg-background/10">
                        {isMac ? "⌘" : "Ctrl"}
                      </Kbd>
                      <span>+</span>
                      <Kbd className="bg-background/20 text-background dark:bg-background/10">
                        ⏎
                      </Kbd>
                    </KbdGroup>
                  )}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBuilds(!showBuilds)}
              disabled={!builds}
            >
              <FolderOpen />
              {showBuilds ? "Hide" : "View"} Saved Builds ({builds?.length ?? 0}
              )
            </Button>
          </div>
        </form>

        {materials.length > 0 && (
          <div className="mt-8">
            <MaterialGrid
              materials={materials}
              onLoadingProgress={handleLoadingProgress}
              setIsSavedBuild={setIsSavedBuild}
              isSavedBuild={isSavedBuild}
            />
          </div>
        )}

        {showBuilds && builds && (
          <div className="mt-8 rounded-lg border p-6">
            <h3 className="mb-4 text-xl font-semibold">Saved Builds</h3>
            {builds.length === 0 ? (
              <p className="text-muted-foreground">
                No saved builds yet. Create a material list and save it to get
                started!
              </p>
            ) : (
              <div className="space-y-2">
                {builds.map((build) => (
                  <div
                    key={build.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{build.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {build.materials.length} materials •{" "}
                        {new Date(build.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadBuild(build)}
                      >
                        Load
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => build.id && handleDeleteBuild(build.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
