---
name: verify
description: Como rodar e verificar o app Radar (Next.js) em viewport mobile com Playwright.
---

# Verificar o Radar

App Next.js 16 (App Router), tela única mobile-first. Fluxo: splash → welcome → identificação → quiz (8 perguntas, auto-avanço ~650ms) → resultado.

## Rodar

```bash
npm install            # se node_modules não existir
npm run dev            # o Next 16 daemoniza e imprime o PID; app em http://localhost:3000
```

O `npm run dev` retorna imediatamente ("Run kill <pid> to stop it"); logs em `.next/dev/logs/next-development.log`.

## Dirigir (sem Chrome instalado na máquina)

Só há Safari no sistema. Instalar Playwright em diretório temporário:

```bash
cd <scratchpad> && npm init -y && npm i playwright && npx playwright install chromium
```

Viewport mobile: `{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }`.
Testar também 375x667 (iPhone SE) — é onde bugs de compressão flex aparecem.

Passos úteis:
- Splash: `getByRole("button", { name: "Pular abertura" }).click()`
- Welcome: `getByRole("button", { name: "Iniciar check-in" })` — esperar ~1.6s pelas animações antes de screenshot
- Identificação: CPF de teste `14323631740` autopreenche a embarcação "NS Brava Star"
- Quiz: opções three-level são `button.rounded-2xl.border-2`; escala é `button[aria-label*="nível"]`; esperar ~1.1s entre respostas (auto-avanço)

## Invariantes de layout (comportamento de app)

O documento NUNCA rola — `html/body` têm `overflow: hidden` e o shell usa `h-dvh`.
Cada tela (`Screen` em AppChrome.tsx, `.overflow-y-auto`) rola internamente se não couber, com rodapé sticky visível.

Checagens:
- `document.documentElement.scrollWidth <= innerWidth` (sem overflow horizontal; o `input[type=date]` já estourou isso no iOS)
- `window.scrollBy(0, 500)` seguido de `window.scrollY === 0`
- Botão do rodapé (`Continuar` / `Fazer nova avaliação`) sempre visível no viewport

## Pegadinha conhecida

Com o shell de altura fixa, filho flex com `overflow-hidden` pode ser espremido a 0
(`min-height: auto` vira 0). A capa navy da welcome precisa de `shrink-0`.
