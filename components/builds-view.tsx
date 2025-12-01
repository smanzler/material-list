"use client";

import { Build, db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Spinner } from "./ui/spinner";
import { Button } from "./ui/button";
import { Plus, Trash2, Share2 } from "lucide-react";
import Link from "next/link";
import { Empty, EmptyDescription, EmptyTitle } from "./ui/empty";
import { createBuildUrl } from "@/lib/build-encoding";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useState } from "react";

function BuildCard({ build }: { build: Build }) {
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = (build: Omit<Build, "id">) => {
    const url = createBuildUrl(build);
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;

    try {
      await db.builds.delete(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
      <div className="flex-1">
        <div className="font-medium">{build.name}</div>
        <div className="text-sm text-muted-foreground">
          {build.materials.length} materials •{" "}
          {new Date(build.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={createBuildUrl(build)}>View</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleShare(build)}
        >
          {shareSuccess ? "Copied!" : <Share2 />}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-minecraft">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Build</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this build?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(build.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col gap-4 p-8 md:p-20 max-w-2xl mx-auto min-h-dvh">
      {builds.length === 0 ? (
        <Empty>
          <EmptyTitle>No builds yet</EmptyTitle>
          <EmptyDescription>
            Create a material list and save it to get started!
          </EmptyDescription>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/">
              <Plus />
              Create build
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Builds</h2>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/">
                <Plus />
                Create build
              </Link>
            </Button>
          </div>
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}
    </div>
  );
}
