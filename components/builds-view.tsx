"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Empty, EmptyDescription, EmptyTitle } from "./ui/empty";

export function BuildsView() {
  const builds = useLiveQuery(() => db.builds.toArray());

  if (builds === undefined) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto min-h-dvh">
      {builds.length === 0 ? (
        <Empty>
          <EmptyTitle>No builds yet</EmptyTitle>
          <EmptyDescription>
            Create a material list and save it to get started!
          </EmptyDescription>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/">
              <Plus className="h-4 w-4" />
              Create build
            </Link>
          </Button>
        </Empty>
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
                <Button type="button" variant="outline" size="sm">
                  Load
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
