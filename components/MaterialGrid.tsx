"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getBlockImageUrl } from "@/lib/block-image-map";
import Image from "next/image";
import { Package } from "lucide-react";
import { Progress } from "./ui/progress";

interface MaterialGridProps {
  materials: string[];
  onLoadingProgress?: (progress: number, isComplete: boolean) => void;
}

function formatMaterialName(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function MaterialCard({ material }: { material: string }) {
  const formattedName = formatMaterialName(material);
  const imageUrl = getBlockImageUrl(material);

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "rounded-lg border border-border bg-card p-4",
        "transition-all hover:border-primary hover:shadow-md",
        "min-h-[120px]"
      )}
    >
      <div
        className={cn(
          "mb-2 flex h-16 w-16 items-center justify-center rounded-lg"
        )}
      >
        {imageUrl ? (
          <Image
            width={64}
            height={64}
            src={imageUrl}
            alt={formattedName}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="text-center text-sm font-medium leading-tight">
        {formattedName}
      </h3>
    </div>
  );
}

/**
 * Preloads an image and returns a promise that resolves when loaded or rejects on error
 */
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export function MaterialGrid({
  materials,
  onLoadingProgress,
}: MaterialGridProps) {
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  React.useEffect(() => {
    if (!materials || materials.length === 0) {
      return;
    }

    const imageUrls = materials
      .map((material) => getBlockImageUrl(material))
      .filter((url): url is string => url !== undefined);

    if (imageUrls.length === 0) {
      setImagesLoaded(true);
      onLoadingProgress?.(100, true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const loadPromises = imageUrls.map((url) =>
      preloadImage(url)
        .then(() => {
          loadedCount++;
          const progress = Math.round((loadedCount / totalImages) * 100);
          setLoadingProgress(progress);
          onLoadingProgress?.(progress, false);
        })
        .catch(() => {
          loadedCount++;
          const progress = Math.round((loadedCount / totalImages) * 100);
          setLoadingProgress(progress);
          onLoadingProgress?.(progress, false);
        })
    );

    Promise.all(loadPromises).then(() => {
      setImagesLoaded(true);
      onLoadingProgress?.(100, true);
    });
  }, [materials, onLoadingProgress]);

  if (!materials || materials.length === 0) {
    return null;
  }

  if (!imagesLoaded) {
    return (
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Your Material List ({materials.length} items)
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-lg text-muted-foreground">
            Loading images... {loadingProgress}%
          </div>
          <div className="w-full max-w-md">
            <Progress value={loadingProgress} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold">
        Your Material List ({materials.length} items)
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {materials.map((material, index) => (
          <MaterialCard key={`${material}-${index}`} material={material} />
        ))}
      </div>
    </div>
  );
}
