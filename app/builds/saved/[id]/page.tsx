import { SavedBuildView } from "@/components/saved-build-view";

export default async function SavedBuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SavedBuildView id={id} />;
}
