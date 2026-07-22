import type { SVGProps } from "react";

/*
 * Conjunto de ícones próprio do Radar.
 * Linguagem: grade 24px, traço 2, pontas arredondadas, motivos concêntricos
 * ecoando a marca (círculos + arcos). Sempre `currentColor`.
 */

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="m5 12.8 4.3 4.3L19 7.4" />
    </Svg>
  );
}

export function IconLock(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2.5" />
      <path d="M8.5 10.5V8.2a3.5 3.5 0 0 1 7 0v2.3" />
      <path d="M12 14v2" />
    </Svg>
  );
}

export function IconId(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.6" />
      <circle cx="8.7" cy="10.4" r="1.9" />
      <path d="M6 15.6c.6-1.6 4.8-1.6 5.4 0" />
      <path d="M14 9.6h4.5" />
      <path d="M14 13h4.5" />
    </Svg>
  );
}
