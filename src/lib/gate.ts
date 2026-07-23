/*
 * Cliente do gate de participação (cpf_gate) — contrato /api/v2/participantes.
 *
 * Fluxo: validar-identidade → sessao (token opaco, single-use, só em memória)
 * → formulario → form_url (Tally específico da pessoa).
 *
 * Sem NEXT_PUBLIC_API_BASE_URL definida, cai no mock local (dev/demo offline),
 * com os mesmos documentos de teste de sempre.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ValidarIdentidadeResponse = {
  elegivel: boolean;
  sessao: string | null;
  mensagem: string | null;
};

export type FormularioResponse = {
  form_url: string;
};

export type GateErrorKind = "rate-limit" | "invalid-session" | "network";

export class GateError extends Error {
  constructor(public kind: GateErrorKind) {
    super(kind);
    this.name = "GateError";
  }
}

/** form_url fica aqui entre o resultado e a página do questionário (morre com a aba). */
export const FORM_URL_STORAGE_KEY = "copsoq:form_url";

/** Converte o form_url (tally.so/r/...) pra URL de embed com os parâmetros do nosso layout. */
export function toEmbedUrl(formUrl: string) {
  const url = new URL(formUrl);
  url.pathname = url.pathname.replace(/^\/r\//, "/embed/");
  url.searchParams.set("hideTitle", "1");
  url.searchParams.set("transparentBackground", "1");
  url.searchParams.set("dynamicHeight", "1");
  return url.toString();
}

export async function validarIdentidade(identidade: string): Promise<ValidarIdentidadeResponse> {
  if (!API_BASE) return mockValidarIdentidade(identidade);

  const response = await post(`${API_BASE}/participantes/validar-identidade`, { identidade });
  return response.json();
}

export async function obterFormulario(sessao: string): Promise<FormularioResponse> {
  if (!API_BASE) return mockObterFormulario();

  const response = await post(`${API_BASE}/participantes/formulario`, { sessao });
  return response.json();
}

async function post(url: string, body: unknown): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GateError("network");
  }
  if (response.status === 429) throw new GateError("rate-limit");
  // 400 no /formulario: token inválido, expirado ou já usado — volta pro passo 1, sem retry.
  if (response.status === 400) throw new GateError("invalid-session");
  if (!response.ok) throw new GateError("network");
  return response;
}

/* ------------------------------ mock (dev) ------------------------------ */

const MOCK_FOUND = new Set(["14323631740", "AB123456"]);
const MOCK_FORM_URL = "https://tally.so/r/RGr7ZK";

async function mockValidarIdentidade(identidade: string): Promise<ValidarIdentidadeResponse> {
  await sleep(600);
  if (!MOCK_FOUND.has(identidade)) {
    // mensagem null de propósito: deixa a copy local (PT/EN) do app responder.
    return { elegivel: false, sessao: null, mensagem: null };
  }
  return { elegivel: true, sessao: `mock-sessao-${Date.now()}`, mensagem: null };
}

async function mockObterFormulario(): Promise<FormularioResponse> {
  await sleep(300);
  return { form_url: MOCK_FORM_URL };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
