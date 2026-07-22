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

export function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="m5 12.8 4.3 4.3L19 7.4" />
    </Svg>
  );
}

export function IconQuestions(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.24c-.8.38-1.2.96-1.2 1.76" />
      <circle cx="12" cy="16.6" r="0.4" fill="currentColor" />
    </Svg>
  );
}

export function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8V12l2.8 1.8" />
    </Svg>
  );
}

export function IconPulse(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" strokeOpacity="0.3" />
      <circle cx="12" cy="12" r="4.8" strokeOpacity="0.6" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
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

export function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M21.5 16.7v2.6a1.9 1.9 0 0 1-2.1 1.9 19 19 0 0 1-8.3-2.95 18.7 18.7 0 0 1-5.75-5.75A19 19 0 0 1 2.4 4.1 1.9 1.9 0 0 1 4.3 2h2.6a1.9 1.9 0 0 1 1.9 1.63c.12.92.34 1.82.66 2.68a1.9 1.9 0 0 1-.43 2L7.9 9.44a15.2 15.2 0 0 0 5.66 5.66l1.13-1.13a1.9 1.9 0 0 1 2-.43c.86.32 1.76.54 2.68.66a1.9 1.9 0 0 1 1.63 1.94Z" />
    </Svg>
  );
}

export function IconAlert(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.2v4.6" />
      <circle cx="12" cy="16.4" r="0.4" fill="currentColor" />
    </Svg>
  );
}

export function IconCheckCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.4 2.6 2.6 5-5.6" />
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

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <rect x="4" y="6" width="16" height="14.5" rx="2.6" />
      <path d="M8.5 3.8v4M15.5 3.8v4M4 11h16" />
    </Svg>
  );
}

export function IconAnchor(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="5.8" r="2.1" />
      <path d="M12 7.9v12.6" />
      <path d="M4.5 12.7a7.5 7.5 0 0 0 15 0" />
      <path d="M4.5 12.7H7M17 12.7h2.5" />
    </Svg>
  );
}
