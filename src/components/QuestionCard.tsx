"use client";

import { AnimatePresence, motion } from "motion/react";

interface QuestionCardProps {
  question: string;
  type: "three-level" | "scale-five";
  options?: string[];
  selectedValue: number | null;
  onSelect: (value: number) => void;
  direction: number;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -64 : 64, opacity: 0 }),
};

/*
 * Rostos da escala — desenhados na mesma linguagem do conjunto de ícones
 * (traço arredondado, geometria simples), em vez de emojis do sistema.
 */
const faces = [
  {
    label: "Muito mal",
    mouth: "M16.5 33Q24 27 31.5 33",
    brows: ["M13.5 17.2l5-2.4", "M34.5 17.2l-5-2.4"],
    happyEyes: false,
  },
  { label: "Mal", mouth: "M16.5 32Q24 28.5 31.5 32", happyEyes: false },
  { label: "Neutro", mouth: "M17 31h14", happyEyes: false },
  { label: "Bem", mouth: "M16.5 29Q24 34.5 31.5 29", happyEyes: false },
  { label: "Excelente", mouth: "M15.5 27.5Q24 36 32.5 27.5", happyEyes: true },
] as const;

function FaceIcon({ face, selected }: { face: (typeof faces)[number]; selected: boolean }) {
  const stroke = selected ? "var(--paper)" : "currentColor";
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <g stroke={stroke} strokeWidth={2.6} strokeLinecap="round" fill="none">
        {face.happyEyes ? (
          <>
            <path d="M13.8 20.3Q17 16.6 20.2 20.3" />
            <path d="M27.8 20.3Q31 16.6 34.2 20.3" />
          </>
        ) : (
          <>
            <circle cx="17" cy="19.5" r="1.5" fill={stroke} strokeWidth={1.4} />
            <circle cx="31" cy="19.5" r="1.5" fill={stroke} strokeWidth={1.4} />
          </>
        )}
        {"brows" in face && face.brows?.map((d) => <path key={d} d={d} />)}
        <path d={face.mouth} />
      </g>
    </svg>
  );
}

export function QuestionCard({
  question,
  type,
  options,
  selectedValue,
  onSelect,
  direction,
}: QuestionCardProps) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <h2 className="pt-7 font-display text-[1.45rem] font-medium leading-snug text-navy">
        {question}
      </h2>

      <div className="flex flex-1 flex-col justify-center pb-14">
        {type === "three-level" && options ? (
          <div className="space-y-3">
            {options.map((option, index) => {
              const selected = selectedValue === index;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(index)}
                  className={`w-full rounded-2xl border-2 p-4 text-left text-[15px] font-normal leading-snug transition-colors duration-150 ${
                    selected
                      ? "border-teal bg-teal text-paper shadow-md shadow-teal/25"
                      : "border-transparent bg-paper text-navy shadow-sm active:bg-gray-4"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        selected ? "border-paper" : "border-gray-2"
                      }`}
                    >
                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-paper" />}
                    </span>
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex w-full justify-between px-1">
              {faces.map((face, index) => {
                const value = index + 1;
                const selected = selectedValue === value;
                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.82 }}
                    animate={{ scale: selected ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 460, damping: 12 }}
                    onClick={() => onSelect(value)}
                    aria-label={`${face.label} — nível ${value} de 5`}
                    className={`h-16 w-16 rounded-full p-2 transition-colors duration-150 ${
                      selected
                        ? "bg-teal text-paper shadow-lg shadow-teal/30"
                        : "bg-paper text-navy/70 shadow-sm"
                    }`}
                  >
                    <FaceIcon face={face} selected={selected} />
                  </motion.button>
                );
              })}
            </div>
            <div className="flex w-full justify-between px-1 text-[13px] font-light text-gray-1">
              <span>Muito mal</span>
              <span>Excelente</span>
            </div>
            <div className="h-7">
              <AnimatePresence mode="wait">
                {selectedValue !== null && (
                  <motion.p
                    key={selectedValue}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="text-center font-display text-base font-medium text-teal"
                  >
                    {faces[selectedValue - 1].label}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
