"use client";

import * as React from "react";
import { getBlockImageUrl } from "@/lib/block-image-map";
import Image from "next/image";
import { Package } from "lucide-react";
import { Progress } from "./ui/progress";
import type { Material } from "@/app/page";

interface MaterialGridProps {
  materials: Material[];
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

function MaterialCard({ material }: { material: Material }) {
  const formattedName = formatMaterialName(material.name);
  const imageUrl = getBlockImageUrl(material.name);
  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  React.useEffect(() => {
    if (!isHovered || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const offset = 10;
    let x = mousePosition.x + offset;
    let y = mousePosition.y + offset;

    if (x + tooltipRect.width > window.innerWidth) {
      x = mousePosition.x - tooltipRect.width - offset;
    }

    if (y + tooltipRect.height > window.innerHeight) {
      y = mousePosition.y - tooltipRect.height - offset;
    }

    if (x < 0) {
      x = offset;
    }

    if (y < 0) {
      y = offset;
    }

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }, [mousePosition, isHovered]);

  return (
    <>
      <div
        className="relative flex items-center justify-center w-20 h-20 p-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
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
          <Package className="h-16 w-16 text-muted-foreground" />
        )}
        <span className="text-xl absolute bottom-2 right-2 font-minecraft">
          {material.quantity}
        </span>
      </div>
      {isHovered && (
        <div
          ref={tooltipRef}
          className="fixed pointer-events-none z-50 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border border-border whitespace-nowrap"
        >
          {formattedName}
        </div>
      )}
    </>
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
      .map((material) => getBlockImageUrl(material.name))
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

  const totalQuantity = materials.reduce(
    (sum, material) => sum + material.quantity,
    0
  );

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold">
        Your Material List ({materials.length} types, {totalQuantity} total)
      </h2>
      {!imagesLoaded ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-lg text-muted-foreground">
            Loading images... {loadingProgress}%
          </div>
          <div className="w-full max-w-md">
            <Progress value={loadingProgress} />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap">
          {materials.map((material, index) => (
            <MaterialCard key={`${material}-${index}`} material={material} />
          ))}
        </div>
      )}
    </div>
  );
}
