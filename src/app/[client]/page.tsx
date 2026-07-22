import { notFound } from "next/navigation";
import { RadarApp } from "@/components/RadarApp";
import { clientSlugs, getClient } from "@/clients";

export function generateStaticParams() {
  return clientSlugs.map((client) => ({ client }));
}

export default async function ClientPage({ params }: PageProps<"/[client]">) {
  const { client } = await params;
  const brand = getClient(client);
  if (!brand) notFound();

  return <RadarApp client={brand} />;
}
