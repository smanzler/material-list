"use client";

import { Field, FieldLabel, FieldContent, FieldError } from "./ui/field";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Kbd, KbdGroup } from "./ui/kbd";
import { FolderOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Material } from "./generator";

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

export function GeneratorForm({
  setMaterials,
}: {
  setMaterials: (materials: Material[]) => void;
}) {
  const [materialList, setMaterialList] = useState("");
  const [error, setError] = useState<string | null>(null);
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

      const parsedMaterials = parseMaterialList(materialList);
      setMaterials(parsedMaterials);
    },
    [materialList]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (isMac ? e.metaKey : e.ctrlKey) &&
        e.key === "Enter" &&
        materialList.trim()
      ) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [materialList, isMac, handleSubmit]);

  return (
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
        <Button type="submit" className="flex-1">
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
        </Button>
        <Button type="button" variant="outline">
          <FolderOpen />
        </Button>
      </div>
    </form>
  );
}
