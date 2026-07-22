---
name: verify
description: Como rodar e verificar o app Radar (Next.js) em viewport mobile com Playwright.
---

# Verificar o Radar

App Next.js 16 (App Router), tela única mobile-first, tudo em `src/components/RadarApp.tsx`.
Fluxo: splash → formulário (CPF/passaporte) → análise (~4s, cartão 3D animado) → resultado (localizado / não localizado).

## Rodar

```bash
npm install            # se node_modules não existir
npm run dev            # o Next 16 daemoniza e imprime o PID; app em http://localhost:3000
```

O `npm run dev` retorna imediatamente ("Run kill <pid> to stop it"); logs em `.next/dev/logs/next-development.log`.
Se a porta 3000 estiver ocupada, ele usa a 3001 — confira a saída.

## Dirigir (sem Chrome instalado na máquina)

Só há Safari no sistema. Instalar Playwright em diretório temporário:

```bash
cd <scratchpad> && npm init -y && npm i playwright && npx playwright install chromium
```

Viewport mobile: `{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }`.
Testar também 375x667 e 360x640 — é onde bugs de altura (conteúdo colado no header, CTA cortado) aparecem.

Passos úteis:
- Splash: `getByRole("button", { name: /Pular abertura/ }).click()`
- Formulário: `page.fill("#document", ...)` e `getByRole("button", { name: /Verificar documento/ })`
- Documentos na base de teste (`FOUND_DOCUMENTS`): CPF `14323631740`, passaporte `AB123456` → "Cadastro localizado"
- Qualquer outro CPF válido (ex.: `52998224725`) → "Cadastro não localizado"
- Análise leva `RESULT_DELAY` (4.1s); esperar ~5.2s após submeter para o resultado assentar as animações
- Idioma: toggle PT/EN no header

## Invariantes de layout (comportamento de app)

O documento NUNCA rola — `html/body` têm `overflow: hidden` e o shell usa `h-dvh` (mobile) /
altura fixa com `overflow-hidden` (desktop ≥sm). Cada tela (`main` com `.overflow-y-auto`)
rola internamente se não couber; conteúdo centralizado usa `my-auto` num wrapper `shrink-0`
(nunca `justify-center` + `overflow-hidden`, que corta por cima).

Checagens:
- `document.documentElement.scrollWidth <= innerWidth` (sem overflow horizontal)
- `window.scrollBy(0, 500)` seguido de `window.scrollY === 0`
- Gap entre o header e o primeiro elemento de cada tela > 0 em 375x667
- CTA do resultado ("Responder questionário" / "Tentar outro documento") sempre visível
  no viewport — é rodapé sticky com fade gradiente

## Pegadinha conhecida

Com o shell de altura fixa, filho flex pode ser espremido a 0 (`min-height: auto` vira 0)
ou, com `justify-center` + overflow, cortado por cima. Wrappers de conteúdo precisam de
`shrink-0`; centralização vertical é com `my-auto`.
