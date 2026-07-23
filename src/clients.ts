import type { StaticImageData } from "next/image";
import subsea7 from "./assets/clientes/subsea7.png";

/*
 * Clientes com tela co-branded: url.com/<slug> renderiza o mesmo app
 * com o logo do cliente ao lado da marca BR MED no header.
 * Para adicionar um cliente: soltar o PNG (fundo transparente) em
 * src/assets/clientes/ e registrar aqui.
 */

export type ClientBrand = {
  slug: string;
  name: string;
  logo: StaticImageData;
};

const CLIENTS = {
  subsea7: { slug: "subsea7", name: "Subsea7", logo: subsea7 },
} satisfies Record<string, ClientBrand>;

export const clientSlugs = Object.keys(CLIENTS);

export function getClient(slug: string): ClientBrand | undefined {
  return Object.hasOwn(CLIENTS, slug) ? CLIENTS[slug as keyof typeof CLIENTS] : undefined;
}
