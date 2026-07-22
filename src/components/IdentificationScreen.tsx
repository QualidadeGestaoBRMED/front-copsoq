"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { PrimaryButton, StickyFooter, TopBar } from "./AppChrome";
import { IconAnchor, IconCalendar, IconCheck, IconId, IconLock, IconPhone } from "./icons";

interface IdentificationData {
  cpf: string;
  embarqueDate: string;
  vessel: string;
  phone: string;
}

interface IdentificationScreenProps {
  onComplete: (data: IdentificationData) => void;
  onBack: () => void;
}

const CPF_VESSEL_MAP: Record<string, string> = {
  "14323631740": "NS Brava Star",
};

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function Field({
  label,
  icon,
  error,
  valid,
  helper,
  children,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  valid?: boolean;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-navy">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-2">
          {icon}
        </span>
        {children}
        {valid && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-teal"
          >
            <IconCheck className="h-5 w-5" />
          </motion.span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-normal text-rust">{error}</p>
      ) : (
        helper && <p className="mt-1.5 text-xs font-normal text-teal">{helper}</p>
      )}
    </div>
  );
}

const inputCls = (error?: string, trailing = true) =>
  `w-full rounded-xl border bg-paper py-4 pl-12 ${trailing ? "pr-11" : "pr-4"} text-navy placeholder:text-gray-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors ${
    error ? "border-rust" : "border-gray-3"
  }`;

export function IdentificationScreen({ onComplete, onBack }: IdentificationScreenProps) {
  const [cpf, setCpf] = useState("");
  const [embarqueDate, setEmbarqueDate] = useState("");
  const [vessel, setVessel] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cpfValid = cpf.replace(/\D/g, "").length === 11;
  const vesselValid = vessel.trim().length > 0;
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const isAutoFilled = CPF_VESSEL_MAP[cpf.replace(/\D/g, "")] === vessel && vessel !== "";

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);

    const digits = value.replace(/\D/g, "");
    const mapped = CPF_VESSEL_MAP[digits];
    if (mapped) {
      setVessel(mapped);
    } else if (CPF_VESSEL_MAP[cpf.replace(/\D/g, "")] === vessel) {
      // Clear only if vessel was auto-filled by previous CPF
      setVessel("");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!cpfValid) newErrors.cpf = "Digite um CPF válido com 11 dígitos.";
    if (!embarqueDate) newErrors.embarqueDate = "Informe a data de embarque.";
    if (!vesselValid) newErrors.vessel = "Informe a embarcação ou plataforma.";
    if (!phoneValid) newErrors.phone = "Digite um telefone válido.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onComplete({ cpf, embarqueDate, vessel, phone });
  };

  return (
    <>
      <header className="px-5">
        <TopBar onBack={onBack} />
        <div className="px-1 pt-2">
          <p className="kicker mb-1 text-teal">Identificação</p>
          <h1 className="font-display text-2xl font-semibold text-navy">Sobre você</h1>
          <p className="mt-1 text-sm leading-relaxed text-gray-1">
            Usamos esses dados apenas para acompanhar seu embarque.
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-6">
        <Field
          label="CPF"
          icon={<IconId className="h-5 w-5" />}
          error={errors.cpf}
          valid={cpfValid}
        >
          <input
            type="text"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder="000.000.000-00"
            className={inputCls(errors.cpf)}
          />
        </Field>

        <Field
          label="Data de embarque"
          icon={<IconCalendar className="h-5 w-5" />}
          error={errors.embarqueDate}
        >
          <input
            type="date"
            value={embarqueDate}
            onChange={(e) => setEmbarqueDate(e.target.value)}
            className={inputCls(errors.embarqueDate, false)}
          />
        </Field>

        <Field
          label="Embarcação ou plataforma"
          icon={<IconAnchor className="h-5 w-5" />}
          error={errors.vessel}
          valid={vesselValid}
          helper={isAutoFilled ? "Preenchida automaticamente a partir do seu CPF." : undefined}
        >
          <input
            type="text"
            value={vessel}
            onChange={(e) => setVessel(e.target.value)}
            placeholder="Ex: NS Brava Star, P-77..."
            className={inputCls(errors.vessel)}
          />
        </Field>

        <Field
          label="Telefone"
          icon={<IconPhone className="h-5 w-5" />}
          error={errors.phone}
          valid={phoneValid}
        >
          <input
            type="text"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            className={inputCls(errors.phone)}
          />
        </Field>

        <div className="flex items-start justify-center gap-2 pt-1">
          <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <p className="text-[13px] font-light leading-snug text-gray-1">
            Seus dados são protegidos e usados somente para este check-in.
          </p>
        </div>
      </div>

      <StickyFooter>
        <PrimaryButton onClick={handleSubmit}>Continuar</PrimaryButton>
      </StickyFooter>
    </>
  );
}
