import type { Metadata } from "next";
import { QuestionnairePage } from "@/components/QuestionnairePage";

export const metadata: Metadata = {
  title: "Questionário | BR MED",
  description: "Questionário da Avaliação Psicossocial.",
};

export default function Questionario() {
  return <QuestionnairePage />;
}
