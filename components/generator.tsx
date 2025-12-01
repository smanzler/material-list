"use client";

import { useState } from "react";
import { MaterialGrid } from "@/components/material-grid";
import { GeneratorForm } from "./generator-form";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Field, FieldLabel, FieldContent, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";

export interface Material {
  name: string;
  quantity: number;
}

export function Generator() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [buildName, setBuildName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      const id = await db.builds.add({
        name: buildName.trim(),
        materials,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setBuildName("");
      setShowSaveDialog(false);
      setError(null);

      router.push(`/builds/${id}`);
    } catch (err) {
      setError("Failed to save build");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GeneratorForm setMaterials={setMaterials} />
      {materials.length > 0 && (
        <>
          <MaterialGrid materials={materials} />

          <Button
            type="button"
            variant="ghost"
            className="mt-4 self-end"
            onClick={() => setShowSaveDialog(true)}
          >
            Save Build
            <Save />
          </Button>
        </>
      )}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setBuildName("");
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveBuild}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
