"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Spinner } from "./ui/spinner";
import { Empty, EmptyDescription, EmptyTitle } from "./ui/empty";
import { SavedGrid } from "./saved-grid";

export function SavedBuildView({ id }: { id: string }) {
  const build = useLiveQuery(() => db.builds.get(Number(id)));

  if (build === undefined) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Spinner />
      </div>
    );
  }

  if (!build) {
    return (
      <Empty>
        <EmptyTitle>Build not found</EmptyTitle>
        <EmptyDescription>
          The build you are looking for does not exist.
        </EmptyDescription>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/builds">
            <ArrowLeft />
            Back to Builds
          </Link>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-8 md:p-20 max-w-4xl mx-auto">
      <Button
        className="w-fit mb-4"
        type="button"
        variant="link"
        size="sm"
        asChild
      >
        <Link href="/builds">
          <ArrowLeft />
          Back to Builds
        </Link>
      </Button>
      <SavedGrid build={build} />
    </div>
  );
}
