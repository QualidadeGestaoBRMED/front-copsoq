"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import type { ClientBrand } from "@/clients";
import { Header } from "@/components/RadarApp";
import { FORM_URL_STORAGE_KEY, toEmbedUrl } from "@/lib/gate";

/*
 * Formulário COPSOQ AEP hospedado no Tally, específico da pessoa: o form_url
 * vem do gate (validação de documento) via sessionStorage. Sem ele — acesso
 * direto à URL — volta pra landing. dynamicHeight=1 faz o iframe crescer até
 * a altura do formulário via embed.js — quem rola é o <main> (o documento
 * nunca rola, ver globals.css).
 */

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

export function QuestionnairePage({ client }: { client?: ClientBrand } = {}) {
  const router = useRouter();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const formUrl = sessionStorage.getItem(FORM_URL_STORAGE_KEY);
    if (!formUrl) {
      router.replace(client ? `/${client.slug}` : "/");
      return;
    }
    setEmbedUrl(toEmbedUrl(formUrl));
  }, [router, client]);

  // O iframe só entra no DOM depois que o embedUrl resolve — se o embed.js
  // já tiver carregado a essa altura, o onLoad do <Script> não roda de novo.
  useEffect(() => {
    if (embedUrl) window.Tally?.loadEmbeds();
  }, [embedUrl]);

  // O documento não rola (app-shell) — quem rola é o <main>. O embed.js do
  // Tally rola a janela (no-op aqui), então tratamos nós mesmos os eventos
  // que ele manda via postMessage: troca de página → topo; pergunta
  // obrigatória sem resposta → rola até ela (mesmo cálculo do embed.js,
  // trocando window pelo <main>).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://tally.so" || typeof event.data !== "string") return;
      const main = mainRef.current;
      if (!main) return;

      if (event.data.includes("Tally.FormPageView")) {
        main.scrollTo({ top: 0 });
        return;
      }

      if (event.data.includes("Tally.FormHighlightFirstError")) {
        let offset = 0;
        try {
          offset = JSON.parse(event.data)?.payload?.offset ?? 0;
        } catch {
          return;
        }
        const iframe = iframeRef.current;
        if (!iframe) return;
        const top =
          iframe.getBoundingClientRect().top -
          main.getBoundingClientRect().top +
          main.scrollTop +
          offset -
          main.clientHeight * 0.05;
        main.scrollTo({ top, behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-background">
      <Header client={client} />
      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-10">
        <div className="mx-auto w-full max-w-2xl pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:max-w-none">
          {embedUrl && (
            <iframe
              ref={iframeRef}
              data-tally-src={embedUrl}
              loading="lazy"
              width="100%"
              height={1238}
              title="Questionário — Avaliação Psicossocial"
              className="w-full border-0"
            />
          )}
        </div>
      </main>
      <Script src="https://tally.so/widgets/embed.js" onLoad={() => window.Tally?.loadEmbeds()} />
    </div>
  );
}
