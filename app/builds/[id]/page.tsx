import { BuildView } from "@/components/build-view";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { decodeBuild } from "@/lib/build-encoding";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const build = decodeBuild(id);

  if (!build) {
    return (
      <Empty>
        <EmptyTitle>Build not found</EmptyTitle>
        <EmptyDescription>
          The build you are looking for does not exist.
        </EmptyDescription>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/builds">
            <ArrowLeft className="h-4 w-4" />
            Back to builds
          </Link>
        </Button>
      </Empty>
    );
  }

  return <BuildView build={build} />;
}
