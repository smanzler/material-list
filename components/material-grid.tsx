"use client";

import * as React from "react";
import { getBlockImageUrl } from "@/lib/block-image-map";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "./ui/button";
import type { Material } from "@/app/page";

function formatMaterialName(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatQuantity(quantity: number, showStacks: boolean): string {
  if (!showStacks) {
    return quantity.toString();
  }

  const stacks = Math.floor(quantity / 64);
  const remainder = quantity % 64;

  if (stacks === 0) {
    return remainder.toString();
  }

  if (remainder === 0) {
    return `${stacks}s`;
  }

  return `${stacks}s+${remainder}`;
}

function MaterialCard({
  material,
  showStacks,
}: {
  material: Material;
  showStacks: boolean;
}) {
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
          {formatQuantity(material.quantity, showStacks)}
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

export function MaterialGrid({ materials }: { materials: Material[] }) {
  const [showStacks, setShowStacks] = React.useState(false);

  if (!materials || materials.length === 0) {
    return null;
  }

  const totalQuantity = materials.reduce(
    (sum, material) => sum + material.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Your Material List ({materials.length} types, {totalQuantity} total)
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStacks(!showStacks)}
        >
          {showStacks ? "Show Count" : "Show Stacks"}
        </Button>
      </div>
      <div className="flex flex-wrap">
        {materials.map((material, index) => (
          <MaterialCard
            key={`${material}-${index}`}
            material={material}
            showStacks={showStacks}
          />
        ))}
      </div>
    </div>
  );
}
