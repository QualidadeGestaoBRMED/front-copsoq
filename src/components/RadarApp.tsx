"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import logoHorizontal from "../assets/marca-horizontal-branco.png";
import logoVertical from "../assets/marca-vertical-branco.png";
import { IconCheck, IconId, IconLock } from "./icons";
import type { ClientBrand } from "../clients";

type Step = "splash" | "form" | "loading" | "found" | "not-found";
type Language = "pt" | "en";
type DocumentKind = "cpf" | "passport" | "unknown";

const SPLASH_DURATION = 2200;
const RESULT_DELAY = 4100;
const FOUND_DOCUMENTS = new Set(["14323631740", "AB123456"]);

const copy = {
  pt: {
    assessment: "Avaliação Psicossocial",
    title: "Verificação prévia\nda avaliação",
    intro: "Informe seu CPF ou passaporte para verificarmos seu cadastro antes do questionário.",
    currentStep: "Etapa atual",
    identification: "Identificação",
    questionnaireStep: "Questionário",
    document: "Documento",
    unknown: "CPF ou passaporte",
    cpf: "CPF identificado",
    passport: "Passaporte identificado",
    placeholder: "CPF ou passaporte",
    helper: "O tipo de documento é identificado automaticamente.",
    invalidCpf: "Digite um CPF válido para continuar.",
    invalidPassport: "Digite um passaporte válido com 6 a 12 caracteres.",
    verify: "Verificar documento",
    privacy: "Seus dados são protegidos e usados somente para esta consulta.",
    inProgress: "Verificação em andamento",
    checking: "Validando seu documento",
    checkingDescription: (type: string, value: string) =>
      `Estamos verificando se o ${type} ${value} está presente em nossa base.`,
    cpfShort: "CPF",
    passportShort: "passaporte",
    steps: [
      "Validando o documento informado",
      "Consultando nossa base segura",
      "Confirmando o status do cadastro",
    ],
    cancel: "Cancelar consulta",
    foundKicker: "Verificação concluída",
    foundTitle: "Cadastro localizado",
    foundDescription: "Seu documento está presente em nossa base. Você já pode responder ao questionário.",
    notFoundKicker: "Consulta concluída",
    notFoundTitle: "Cadastro não localizado",
    notFoundDescription: "Não encontramos este documento em nossa base neste momento.",
    consulted: "Documento consultado",
    notFoundHelp: "Confira se os dados foram digitados corretamente.",
    questionnaire: "Responder questionário",
    retry: "Tentar outro documento",
  },
  en: {
    assessment: "Psychosocial Assessment",
    title: "Assessment pre-check",
    intro: "Enter your passport so we can verify your registration before the questionnaire.",
    currentStep: "Current step",
    identification: "Identification",
    questionnaireStep: "Questionnaire",
    document: "Document",
    unknown: "Passport",
    cpf: "CPF identified",
    passport: "Passport identified",
    placeholder: "Passport number",
    helper: "Have a Brazilian CPF? You can enter it here instead.",
    invalidCpf: "Enter a valid CPF to continue.",
    invalidPassport: "Enter a valid passport with 6 to 12 characters.",
    verify: "Verify document",
    privacy: "Your data is protected and used only for this verification.",
    inProgress: "Pre-check in progress",
    checking: "Validating your document",
    checkingDescription: (type: string, value: string) =>
      `We are checking whether the ${type} ${value} is in our database.`,
    cpfShort: "CPF",
    passportShort: "passport",
    steps: [
      "Validating the document provided",
      "Checking our secure database",
      "Confirming registration status",
    ],
    cancel: "Cancel verification",
    foundKicker: "Pre-check complete",
    foundTitle: "Registration found",
    foundDescription: "Your document is in our database. You can now answer the questionnaire.",
    notFoundKicker: "Verification complete",
    notFoundTitle: "Registration not found",
    notFoundDescription: "We could not find this document in our database at this time.",
    consulted: "Document checked",
    notFoundHelp: "Check that the details were entered correctly or try again later.",
    questionnaire: "Answer questionnaire",
    retry: "Try another document",
  },
} as const;

function normalizeDocument(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

function detectDocument(value: string): DocumentKind {
  const normalized = normalizeDocument(value);
  if (!normalized) return "unknown";
  return /[A-Z]/.test(normalized) ? "passport" : "cpf";
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatDocument(value: string) {
  const normalized = normalizeDocument(value);
  return /[A-Z]/.test(normalized) ? normalized : formatCpf(normalized);
}

/** Nunca expor o documento completo fora do campo de digitação (LGPD). */
function maskDocument(value: string) {
  const normalized = normalizeDocument(value);
  if (!/[A-Z]/.test(normalized)) {
    return `***.${normalized.slice(3, 6)}.${normalized.slice(6, 9)}-**`;
  }
  return `${normalized.slice(0, 2)}${"*".repeat(Math.max(normalized.length - 4, 0))}${normalized.slice(-2)}`;
}

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function isValidPassport(value: string) {
  const passport = normalizeDocument(value);
  return /^(?=.*[A-Z])[A-Z0-9]{6,12}$/.test(passport);
}

function isComplete(value: string, kind: DocumentKind) {
  if (kind === "cpf") return value.replace(/\D/g, "").length === 11;
  if (kind === "passport") return normalizeDocument(value).length >= 6;
  return false;
}

function BrandLogo({ vertical = false, priority = false }: { vertical?: boolean; priority?: boolean }) {
  return (
    <Image
      src={vertical ? logoVertical : logoHorizontal}
      alt="BR MED Saúde Corporativa"
      priority={priority}
      className={vertical ? "h-auto w-[12.5rem]" : "h-auto w-[7rem] sm:w-[11rem]"}
    />
  );
}

function Splash({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Pular abertura / Skip intro"
      onClick={onSkip}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-teal to-navy outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45 }}
    >
      <div className="brand-glow absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
      >
        <BrandLogo vertical priority />
        <span className="mt-8 h-1 w-14 overflow-hidden rounded-full bg-paper/15">
          <motion.span
            className="block h-full origin-left rounded-full bg-teal-vivid"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.65, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </motion.button>
  );
}

function LanguageSwitch({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="flex items-center rounded-full border border-paper/20 bg-paper/[0.06] p-1" aria-label="Language / Idioma">
      {(["pt", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={language === option}
          className={`rounded-full px-2.5 py-1 font-display text-[0.65rem] font-semibold tracking-[0.08em] transition-colors ${
            language === option ? "bg-paper text-navy" : "text-paper/65"
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Header({
  language = "pt",
  onLanguageChange,
  client,
}: {
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  client?: ClientBrand;
}) {
  return (
    <header className="relative z-20 shrink-0 overflow-hidden rounded-b-[2rem] bg-navy px-5 pb-7 pt-[max(1.25rem,env(safe-area-inset-top))] text-paper sm:px-10">
      <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-teal-vivid/[0.08]" />
      <div className="pointer-events-none absolute right-28 top-0 h-full w-px rotate-[18deg] bg-paper/[0.08]" />
      <div className="relative mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-3 sm:h-[4.5rem]">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-5">
          <BrandLogo priority />
          {client && (
            <>
              <span aria-hidden className="h-7 w-px shrink-0 bg-paper/25 sm:h-9" />
              <Image src={client.logo} alt={client.name} priority className="h-auto max-h-6 w-auto min-w-0 max-w-[6rem] shrink object-contain sm:max-h-9 sm:max-w-[11rem]" />
            </>
          )}
        </div>
        {onLanguageChange && <LanguageSwitch language={language} onChange={onLanguageChange} />}
      </div>
    </header>
  );
}

function DocumentIdentity({ kind, language }: { kind: DocumentKind; language: Language }) {
  const t = copy[language];
  const label = kind === "cpf" ? t.cpf : kind === "passport" ? t.passport : t.unknown;

  return (
    <div className="flex h-7 items-center justify-end overflow-hidden" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={`${language}-${kind}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${
            kind === "unknown" ? "bg-gray-3/55 text-gray-1" : "bg-teal/10 text-teal"
          }`}
          initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
          transition={{ duration: 0.22 }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${kind === "unknown" ? "bg-gray-2" : "bg-teal"}`} />
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function JourneyProgress({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <motion.div
      className="absolute -top-3 left-5 right-5 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl border border-paper/45 bg-paper/30 px-4 py-3 shadow-[0_12px_32px_rgba(25,59,79,0.18),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl backdrop-saturate-150"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
    >
      {/* Reflexo do vidro: luz entrando pelo canto superior esquerdo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-paper/50 via-paper/10 to-transparent" />
      <div className="relative flex items-center">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal font-display text-xs font-semibold text-paper">
            1
          </span>
          <div className="min-w-0">
            <p className="font-display text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.1em] text-teal">
              {t.currentStep}
            </p>
            <p className="truncate font-display text-xs font-medium text-navy">{t.identification}</p>
          </div>
        </div>

        <div className="mx-3 flex min-w-8 flex-1 items-center">
          <span className="h-px w-1/2 bg-teal/60" />
          <span className="h-px flex-1 bg-gray-3" />
        </div>

        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-3 bg-gray-4 font-display text-xs font-medium text-gray-1">
            2
          </span>
          <p className="truncate font-display text-xs font-medium text-gray-1">{t.questionnaireStep}</p>
        </div>
      </div>
    </motion.div>
  );
}

function DocumentForm({
  documentValue,
  language,
  onDocumentChange,
  onSubmit,
}: {
  documentValue: string;
  language: Language;
  onDocumentChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = copy[language];
  const kind = detectDocument(documentValue);
  const complete = isComplete(documentValue, kind);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const valid = kind === "cpf" ? isValidCpf(documentValue) : kind === "passport" && isValidPassport(documentValue);
    if (!valid) {
      setError(kind === "passport" ? t.invalidPassport : t.invalidCpf);
      navigator.vibrate?.(25);
      return;
    }

    setError("");
    inputRef.current?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
    onSubmit();
  };

  const handleChange = (value: string) => {
    onDocumentChange(formatDocument(value));
    if (error) setError("");
  };

  return (
    <main className="relative flex min-h-0 flex-1 flex-col">
      {/* Fora do container de rolagem para poder sobrepor o navy do header (o vidro precisa de cor atrás)
          e fora da subárvore com fade — opacity em ancestral desliga o backdrop-filter até a animação acabar. */}
      <div aria-hidden className="pointer-events-none absolute -top-1 left-1/2 z-20 h-16 w-64 -translate-x-1/2 rounded-full bg-teal-vivid/10 blur-3xl" />
      <JourneyProgress language={language} />
      <motion.div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col pt-26 sm:max-w-md">
        {/* No desktop o bloco centraliza no espaço livre; no mobile flui normal */}
        <div className="sm:my-auto">
        <div className="mb-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal/5 px-3 py-1.5 text-xs font-medium text-teal">
            <span className="h-2 w-2 rounded-sm bg-teal" />
            {t.assessment}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={language}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="max-w-[17ch] whitespace-pre-line font-display text-[2rem] font-semibold leading-[1.12] tracking-[-0.025em] text-navy">
                {t.title}
              </h1>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-gray-1">{t.intro}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="document" className="text-sm font-medium text-navy">{t.document}</label>
            <DocumentIdentity kind={kind} language={language} />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal">
              <IconId className="h-5 w-5" />
            </span>
            <input
              ref={inputRef}
              id="document"
              name="document"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              enterKeyHint="go"
              value={documentValue}
              onChange={(event) => handleChange(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "document-error" : "document-helper"}
              placeholder={t.placeholder}
              className={`h-[4.25rem] w-full rounded-2xl border bg-paper pl-12 pr-12 text-[1.05rem] uppercase tracking-wide text-navy shadow-sm outline-none transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-2 focus:border-teal focus:ring-4 focus:ring-teal/10 ${
                error ? "border-rust ring-4 ring-rust/8" : "border-gray-3"
              }`}
            />
            <AnimatePresence>
              {complete && !error && (
                <motion.span
                  className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-teal text-paper"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 24 }}
                >
                  <IconCheck className="h-4 w-4" strokeWidth={2.4} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="min-h-10 pt-2">
            {error ? (
              <motion.p id="document-error" role="alert" className="text-xs font-normal text-rust" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.p>
            ) : (
              <p id="document-helper" className="text-xs leading-relaxed text-gray-1">{t.helper}</p>
            )}
          </div>

          <motion.button
            type="submit"
            className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-navy font-display text-base font-medium text-paper shadow-lg shadow-navy/20 transition-colors active:bg-teal disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!complete}
            whileTap={{ scale: 0.98 }}
          >
            {t.verify}
            <span aria-hidden className="text-lg leading-none">→</span>
          </motion.button>
        </form>
        </div>

        <div className="mx-auto mt-auto flex max-w-[20rem] items-start justify-center gap-2 pt-10 text-center">
          <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <p className="text-xs font-light leading-relaxed text-gray-1">{t.privacy}</p>
        </div>
      </div>
      </motion.div>
    </main>
  );
}

function DocumentScan({ kind }: { kind: DocumentKind }) {
  return (
    <div className="relative mb-10 h-44 w-72 max-w-full" style={{ perspective: "1100px" }} aria-hidden>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: [0, 0, 180, 180, 360] }}
        transition={{ duration: 5.6, times: [0, 0.3, 0.5, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Frente: crachá BR MED — faixa navy com logo, corpo claro */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.35rem] border border-navy/10 bg-paper shadow-xl shadow-navy/15"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative flex items-center justify-between overflow-hidden bg-navy px-5 py-3">
            <div className="pointer-events-none absolute right-10 top-0 h-full w-px rotate-[18deg] bg-paper/15" />
            <Image src={logoHorizontal} alt="" className="h-auto w-[4.5rem]" />
            <motion.span
              key={kind}
              className="rounded-md bg-paper/10 px-2 py-0.5 font-display text-[0.6rem] font-semibold tracking-wider text-teal-vivid"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {kind === "passport" ? "PASS" : "CPF"}
            </motion.span>
          </div>
          <div className="flex flex-1 items-center gap-4 px-5">
            <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-navy/[0.06]">
              <span className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full bg-navy/15" />
              <span className="absolute left-1/2 top-8 h-8 w-9 -translate-x-1/2 rounded-t-full bg-navy/15" />
            </span>
            <div className="flex-1 space-y-2.5">
              <span className="block h-2 w-full rounded-full bg-navy/10" />
              <span className="block h-2 w-2/3 rounded-full bg-navy/10" />
              <span className="block h-2 w-1/2 rounded-full bg-teal/30" />
            </div>
          </div>
        </div>

        {/* Verso: tarja e zona de leitura */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.35rem] border border-navy/10 bg-paper shadow-xl shadow-navy/15"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="mt-5 h-9 w-full bg-navy/90" />
          <div className="absolute inset-x-5 bottom-5 space-y-2">
            <span className="block h-1.5 w-full rounded-full bg-navy/10" />
            <span className="block h-1.5 w-4/5 rounded-full bg-navy/10" />
            <span className="block h-1.5 w-3/5 rounded-full bg-navy/10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AnalysisScreen({
  documentValue,
  language,
  onBack,
}: {
  documentValue: string;
  language: Language;
  onBack: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const kind = detectDocument(documentValue);
  const t = copy[language];

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setActiveStep(1), 1250),
      window.setTimeout(() => setActiveStep(2), 2600),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <motion.main
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="my-auto flex w-full shrink-0 flex-col items-center pt-8">
        <DocumentScan kind={kind} />
        <p className="kicker mb-3 text-teal">{t.inProgress}</p>
        <h1 className="max-w-[18ch] font-display text-[1.75rem] font-semibold leading-tight text-navy">{t.checking}</h1>
        <p className="mt-3 max-w-[31ch] text-[15px] leading-relaxed text-gray-1" aria-live="polite">
          {t.checkingDescription(kind === "passport" ? t.passportShort : t.cpfShort, maskDocument(documentValue))}
        </p>

        <div className="mt-8 w-full max-w-xs space-y-2.5 text-left">
          {t.steps.map((label, index) => {
            const complete = index < activeStep;
            const active = index === activeStep;
            return (
              <motion.div
                key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active ? "bg-paper shadow-sm" : ""}`}
                animate={{ opacity: index <= activeStep ? 1 : 0.42 }}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${complete ? "border-teal bg-teal text-paper" : active ? "border-teal text-teal" : "border-gray-3 text-gray-2"}`}>
                  {complete ? (
                    <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : active ? (
                    <motion.span className="h-1.5 w-1.5 rounded-sm bg-current" animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity }} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={`text-sm ${active ? "font-normal text-navy" : "text-gray-1"}`}>{label}</span>
              </motion.div>
            );
          })}
        </div>

        <button type="button" onClick={onBack} className="mt-7 text-sm font-medium text-gray-1 underline decoration-gray-2 underline-offset-4">
          {t.cancel}
        </button>
      </div>
    </motion.main>
  );
}

function ResultScreen({
  found,
  documentValue,
  language,
  questionnaireHref,
  onRestart,
}: {
  found: boolean;
  documentValue: string;
  language: Language;
  questionnaireHref: string;
  onRestart: () => void;
}) {
  const t = copy[language];

  return (
    <motion.main
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="mx-auto my-auto flex w-full max-w-sm shrink-0 flex-col justify-center px-5 py-7 text-center sm:max-w-lg">
        <motion.div
          className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.75rem] ${found ? "bg-teal/10 text-teal" : "bg-amber/10 text-amber"}`}
          initial={{ scale: 0.45, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.12 }}
        >
          {found ? <IconCheck className="h-11 w-11" strokeWidth={1.8} /> : <span className="font-display text-[2.5rem] font-light">?</span>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <p className={`kicker mb-2 ${found ? "text-teal" : "text-amber"}`}>{found ? t.foundKicker : t.notFoundKicker}</p>
          <h1 className="mx-auto max-w-[18ch] font-display text-[1.8rem] font-semibold leading-tight text-navy sm:max-w-none">{found ? t.foundTitle : t.notFoundTitle}</h1>
          <p className="mx-auto mt-3 max-w-[31ch] text-[15px] leading-relaxed text-gray-1 sm:max-w-[46ch]">{found ? t.foundDescription : t.notFoundDescription}</p>
        </motion.div>

        <motion.div className="mt-8 rounded-2xl bg-paper p-5 text-left shadow-sm ring-1 ring-navy/[0.04]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.4 }}>
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${found ? "bg-teal/10 text-teal" : "bg-amber/10 text-amber"}`}>
              <IconId className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-gray-1">{t.consulted}</p>
              <p className="mt-0.5 font-display text-sm font-medium tracking-wide text-navy">{maskDocument(documentValue)}</p>
            </div>
          </div>
          {!found && <p className="mt-4 border-t border-gray-3 pt-4 text-sm leading-relaxed text-gray-1">{t.notFoundHelp}</p>}
        </motion.div>
      </div>

      <div className="sticky bottom-0 shrink-0 bg-gradient-to-t from-background via-background to-transparent px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:flex sm:justify-center">
        {found ? (
          <motion.a
            href={questionnaireHref}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-navy font-display text-base font-medium text-paper shadow-lg shadow-navy/20 transition-colors active:bg-teal sm:max-w-md"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {t.questionnaire}
          </motion.a>
        ) : (
          <motion.button
            type="button"
            onClick={onRestart}
            className="h-14 w-full rounded-2xl border border-gray-3 bg-paper font-display text-base font-medium text-navy active:bg-gray-4 sm:max-w-md"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {t.retry}
          </motion.button>
        )}
      </div>
    </motion.main>
  );
}

export function RadarApp({ client }: { client?: ClientBrand } = {}) {
  const [step, setStep] = useState<Step>("splash");
  const [language, setLanguage] = useState<Language>("pt");
  const [documentValue, setDocumentValue] = useState("");

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);

  useEffect(() => {
    if (step !== "splash") return;
    const timer = window.setTimeout(() => setStep("form"), SPLASH_DURATION);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "loading") return;
    const timer = window.setTimeout(() => {
      setStep(FOUND_DOCUMENTS.has(normalizeDocument(documentValue)) ? "found" : "not-found");
      navigator.vibrate?.([18, 45, 18]);
    }, RESULT_DELAY);
    return () => window.clearTimeout(timer);
  }, [step, documentValue]);

  const restart = () => {
    setDocumentValue("");
    setStep("form");
  };

  const questionnaireHref = client ? `/${client.slug}/questionario` : "/questionario";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh bg-background">
        <div className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            {step === "splash" ? (
              <Splash key="splash" onSkip={() => setStep("form")} />
            ) : (
              <motion.div key="app" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Header language={language} onLanguageChange={setLanguage} client={client} />
                <AnimatePresence mode="wait">
                  {step === "form" && (
                    <DocumentForm
                      key="form"
                      documentValue={documentValue}
                      language={language}
                      onDocumentChange={setDocumentValue}
                      onSubmit={() => setStep("loading")}
                    />
                  )}
                  {step === "loading" && (
                    <AnalysisScreen key="loading" documentValue={documentValue} language={language} onBack={() => setStep("form")} />
                  )}
                  {step === "found" && (
                    <ResultScreen key="found" found documentValue={documentValue} language={language} questionnaireHref={questionnaireHref} onRestart={restart} />
                  )}
                  {step === "not-found" && (
                    <ResultScreen key="not-found" found={false} documentValue={documentValue} language={language} questionnaireHref={questionnaireHref} onRestart={restart} />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
