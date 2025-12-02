"use client";

import * as React from "react";
import { getBlockImageUrl } from "@/lib/block-image-map";
import Image from "next/image";
import { Check, Package, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBuildUrl } from "@/lib/build-encoding";
import type { Material } from "@/app/page";
import type { Build } from "@/lib/db";
import { db } from "@/lib/db";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTheme } from "next-themes";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";

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
  isCollected,
  onToggleCollected,
}: {
  material: Material;
  showStacks: boolean;
  isCollected: boolean;
  onToggleCollected: () => Promise<void>;
}) {
  const formattedName = formatMaterialName(material.name);
  const imageUrl = getBlockImageUrl(material.name);
  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(1);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const dotLottieRef = React.useRef<any>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const { resolvedTheme } = useTheme();

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = async () => {
    if (!isCollected && dotLottieRef.current) {
      setIsAnimating(true);
      dotLottieRef.current.stop();
      dotLottieRef.current.setFrame(0);
      dotLottieRef.current.play();

      setTimeout(() => {
        setOpacity(0);
      }, 550);

      setTimeout(async () => {
        await onToggleCollected();
      }, 1500);
    } else {
      await onToggleCollected();
    }
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
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative flex items-center justify-center w-20 h-20 p-2 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <div
          style={{
            opacity: isAnimating ? opacity : isCollected ? 0.5 : 1,
          }}
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
          {isCollected && (
            <Badge
              variant="outline"
              className="absolute top-1 left-1 bg-green-500 px-1"
            >
              <Check />
            </Badge>
          )}
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-50 pointer-events-none"
          style={{
            filter:
              resolvedTheme === "dark" ? "invert(1) brightness(1)" : "none",
            opacity: 1, // Always keep animation at full opacity
          }}
        >
          <DotLottieReact
            src="/animations/black explosion.lottie"
            style={{ width: "100%", height: "100%" }}
            loop={false}
            autoplay={false}
            dotLottieRefCallback={(dotLottie) => {
              dotLottieRef.current = dotLottie;
            }}
          />
        </div>
      </motion.div>
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

export function SavedGrid({ build }: { build: Build }) {
  const [showStacks, setShowStacks] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);

  const handleShare = () => {
    const url = createBuildUrl(build);
    const fullUrl = window.location.origin + url;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  const toggleCollected = async (materialIndex: number) => {
    if (!build.id) return;

    const currentCollected = build.collectedMaterials || [];
    const isCollected = currentCollected.includes(materialIndex);

    const updatedCollected = isCollected
      ? currentCollected.filter((idx) => idx !== materialIndex)
      : [...currentCollected, materialIndex];

    await db.builds.update(build.id, {
      collectedMaterials: updatedCollected,
      updatedAt: Date.now(),
    });
  };

  if (!build.materials || build.materials.length === 0) {
    return null;
  }

  const uncollectedMaterials = build.materials.filter(
    (_, index) => !build.collectedMaterials?.includes(index)
  );
  const collectedMaterialsList = build.materials.filter((_, index) =>
    build.collectedMaterials?.includes(index)
  );

  const totalQuantity = build.materials.reduce(
    (sum, material) => sum + material.quantity,
    0
  );
  const collectedQuantity = collectedMaterialsList.reduce(
    (sum, material) => sum + material.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {build.name} ({build.materials.length} types, {totalQuantity} total)
          {build.collectedMaterials && build.collectedMaterials.length > 0 && (
            <span className="text-lg text-muted-foreground ml-2">
              • {build.collectedMaterials.length} collected ({collectedQuantity}
              )
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {shareSuccess ? "Copied!" : "Share"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStacks(!showStacks)}
          >
            {showStacks ? "Show Count" : "Show Stacks"}
          </Button>
        </div>
      </div>

      {uncollectedMaterials.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">
            To Collect ({uncollectedMaterials.length})
          </h3>
          <motion.div
            layout
            className="flex flex-wrap"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AnimatePresence mode="popLayout">
              {build.materials.map((material, index) => {
                if (build.collectedMaterials?.includes(index)) return null;
                return (
                  <MaterialCard
                    key={`material-${build.id}-${index}`}
                    material={material}
                    showStacks={showStacks}
                    isCollected={false}
                    onToggleCollected={async () => await toggleCollected(index)}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {collectedMaterialsList.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">
            Collected ({collectedMaterialsList.length})
          </h3>
          <motion.div
            layout
            className="flex flex-wrap"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AnimatePresence mode="popLayout">
              {build.materials.map((material, index) => {
                if (!build.collectedMaterials?.includes(index)) return null;
                return (
                  <MaterialCard
                    key={`collected-material-${build.id}-${index}`}
                    material={material}
                    showStacks={showStacks}
                    isCollected={true}
                    onToggleCollected={async () => await toggleCollected(index)}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
}
