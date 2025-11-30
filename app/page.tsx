"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { MaterialGrid } from "@/components/MaterialGrid";
import { Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function parseMaterialList(materialList: string): string[] {
  return materialList
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default function Home() {
  const [materialList, setMaterialList] = useState("");
  const [materials, setMaterials] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!materialList.trim()) {
      setError("Material list cannot be empty");
      return;
    }

    const parsedMaterials = parseMaterialList(materialList);
    setMaterials(parsedMaterials);
    setIsLoading(true);
    setLoadingProgress(0);
  };

  const handleLoadingProgress = (progress: number, isComplete: boolean) => {
    setLoadingProgress(progress);
    if (isComplete) {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <main className="max-w-4xl mx-auto p-8 md:p-20">
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner />
                Loading images... {loadingProgress}%
              </>
            ) : (
              "Generate Visual List"
            )}
          </Button>
        </form>

        {materials.length > 0 && (
          <div className="mt-8">
            <MaterialGrid
              materials={materials}
              onLoadingProgress={handleLoadingProgress}
            />
          </div>
        )}
      </main>
    </div>
  );
}
