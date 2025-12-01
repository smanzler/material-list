import { BuildView } from "@/components/build-view";

export default async function BuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BuildView id={id} />;
}
