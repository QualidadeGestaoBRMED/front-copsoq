# Radar — Check-in de Bem-Estar

Questionário mobile-first de mapeamento de bem-estar pré-embarque para colaboradores do segmento de óleo e gás. Front-end em Next.js + Tailwind CSS, com identidade visual própria (marca neutra).

## Fluxo

1. **Boas-vindas** — capa navy com o que esperar da avaliação
2. **Identificação** — CPF, data de embarque, embarcação/plataforma (auto-preenchida por CPF cadastrado) e telefone
3. **Questionário** — 8 perguntas (múltipla escolha em 3 níveis e escala de 1 a 5 com emojis), com slides direcionais
4. **Resultado** — anel de pontuação animado e classificação por nível de atenção

## Design system

- **Cores**: tokens oficiais em `src/app/globals.css` — navy `#193B4F` (principal), teal `#007891` (apoio/fase atual)
- **Semântica de alerta**: adequado = teal, prioridade/atenção = âmbar `#CC851E`, crítico = terracota `#A05E1E`. Nunca vermelho ou verde puros.
- **Tipografia**: Work Sans (300–600, nunca 700+) para títulos, números e rótulos; Roboto (300 padrão, 400/500 para ênfase) para corpo — via `next/font`
- **Mobile-first**: shell de app com `max-w-md`, safe areas, CTA fixo na zona do polegar, transições de tela com Motion

## Rodando

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — idealmente no modo device do DevTools.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Motion (animações) e Lucide (ícones)

Apenas front-end: as respostas não são enviadas a nenhum servidor.
