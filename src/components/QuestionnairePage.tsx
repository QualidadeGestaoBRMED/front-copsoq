"use client";

import { useEffect, useRef } from "react";
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
  const mainRef = useRef<HTMLElement>(null);

  // O documento não rola (app-shell) — quem rola é o <main>. O Tally não
  // alcança esse scroll ao trocar de página, então subimos nós mesmos
  // quando o embed avisa a mudança via postMessage.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://tally.so") return;
      if (typeof event.data !== "string" || !event.data.includes("Tally.FormPageView")) return;
      mainRef.current?.scrollTo({ top: 0 });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-background">
      <Header client={client} />
      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-10">
        <div className="mx-auto w-full max-w-2xl pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:max-w-none">
          <iframe
            data-tally-src={TALLY_EMBED_URL}
            loading="lazy"
            width="100%"
            height={1238}
            title="Questionário — Avaliação Psicossocial"
            className="w-full border-0"
          />
        </div>
      </main>
      <Script src="https://tally.so/widgets/embed.js" onLoad={() => window.Tally?.loadEmbeds()} />
    </div>
  );
}
