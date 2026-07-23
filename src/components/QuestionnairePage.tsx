"use client";

import Script from "next/script";
import type { ClientBrand } from "@/clients";
import { Header } from "@/components/RadarApp";

/*
 * Formulário COPSOQ AEP hospedado no Tally. dynamicHeight=1 faz o iframe
 * crescer até a altura do formulário via embed.js — quem rola é o <main>
 * (o documento nunca rola, ver globals.css).
 */
const TALLY_EMBED_URL = "https://tally.so/embed/RGr7ZK?hideTitle=1&transparentBackground=1&dynamicHeight=1";

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

export function QuestionnairePage({ client }: { client?: ClientBrand } = {}) {
  return (
    <div className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-background">
      <Header client={client} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-10">
        <div className="mx-auto w-full max-w-2xl pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 sm:max-w-none sm:pt-12">
          <p className="kicker text-center text-teal">Avaliação Psicossocial</p>
          <h1 className="mt-2 text-center font-display text-[1.6rem] font-semibold leading-tight text-navy">Questionário</h1>
          <iframe
            data-tally-src={TALLY_EMBED_URL}
            loading="lazy"
            width="100%"
            height={1238}
            title="Questionário — Avaliação Psicossocial"
            className="mt-6 w-full border-0"
          />
        </div>
      </main>
      <Script src="https://tally.so/widgets/embed.js" onLoad={() => window.Tally?.loadEmbeds()} />
    </div>
  );
}
