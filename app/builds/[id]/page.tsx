import { BuildView } from "@/components/build-view";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { decodeBuild } from "@/lib/build-encoding";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";

const getBuild = cache((id: string) => {
  return decodeBuild(id);
});

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://mclist.simonmanzler.com";
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const build = getBuild(id);

  if (!build) {
    return {
      title: "Build not found",
    };
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/builds/${id}`;
  const title = build.name;
  const description = `View ${build.materials.length} materials for ${build.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Minecraft Material List",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function BuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const build = getBuild(id);

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
