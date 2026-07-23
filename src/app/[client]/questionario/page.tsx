import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuestionnairePage } from "@/components/QuestionnairePage";
import { clientSlugs, getClient } from "@/clients";

export const metadata: Metadata = {
  title: "Questionário | BR MED",
  description: "Questionário da Avaliação Psicossocial.",
};

export function generateStaticParams() {
  return clientSlugs.map((client) => ({ client }));
}

export default async function ClientQuestionario({ params }: PageProps<"/[client]/questionario">) {
  const { client } = await params;
  const brand = getClient(client);
  if (!brand) notFound();

  return <QuestionnairePage client={brand} />;
}
