"use client";

import { useState } from "react";
import { MaterialGrid } from "@/components/material-grid";
import { GeneratorForm } from "./generator-form";
import { Button } from "./ui/button";
import { Save, Share2 } from "lucide-react";
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
import { createBuildUrl } from "@/lib/build-encoding";
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

  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = () => {
    const build = {
      name: `Material List - ${new Date().toLocaleDateString()}`,
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

  return (
    <div className="flex flex-col gap-4">
      <GeneratorForm setMaterials={setMaterials} />
      {materials.length > 0 && (
        <div>
          <MaterialGrid
            materials={materials}
            handleShare={handleShare}
            shareSuccess={shareSuccess}
          />
        </div>
      )}
    </div>
  );
}
