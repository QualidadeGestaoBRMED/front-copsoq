"use client";

import { motion } from "motion/react";
import { SecondaryButton, StickyFooter } from "./AppChrome";
import { IconAlert, IconCheck, IconPhone } from "./icons";
import type { ComponentType, SVGProps } from "react";

interface ResultScreenProps {
  score: number;
  onRestart: () => void;
}

/*
 * Semântica de alerta do brandguide:
 * adequado/normal = teal, prioridade/atenção média = âmbar, crítico = terracota.
 * Nunca vermelho nem verde puros.
 *
 * A pontuação é uma métrica interna de triagem (quanto maior, mais sinais de
 * atenção) e nunca é exibida ao colaborador — o resultado é sempre qualitativo.
 */
function getClassification(score: number) {
  if (score <= 2) {
    return {
      colorClass: "text-teal",
      softBg: "bg-teal/10",
      title: "Tudo certo para o embarque",
      description: "Você apresenta boas condições emocionais para embarcar.",
      cardTitle: null,
      message:
        "Sem necessidade de acompanhamento adicional. Tenha um ótimo embarque! Se precisar, a equipe de Saúde Ocupacional e o RH estão à disposição.",
      icon: IconCheck,
      items: null,
      itemsTitle: null,
    };
  } else if (score <= 5) {
    return {
      colorClass: "text-amber",
      softBg: "bg-amber/10",
      title: "Atenção ao seu bem-estar",
      description: "Você apresenta sinais leves ou moderados de estresse ou vulnerabilidade emocional.",
      cardTitle: "O que acontece agora",
      message:
        "Por precaução, um psicólogo da nossa equipe entrará em contato com você durante o embarque. Enquanto isso, algumas orientações preventivas:",
      icon: IconAlert,
      itemsTitle: "Orientações para você",
      items: [
        "Mantenha uma rotina de sono regular",
        "Pratique técnicas de relaxamento",
        "Mantenha contato com sua rede de apoio",
        "Não hesite em buscar ajuda se precisar",
      ],
    };
  } else {
    return {
      colorClass: "text-rust",
      softBg: "bg-rust/10",
      title: "Vamos conversar antes do embarque",
      description: "Identificamos fatores que pedem uma atenção especializada agora.",
      cardTitle: "O que acontece agora",
      message:
        "Um psicólogo da nossa equipe entrará em contato com você em breve para uma conversa de apoio antes do embarque.",
      icon: IconPhone,
      itemsTitle: "Recomendações para você",
      items: [
        "Fique atento ao seu celular e e-mail cadastrado",
        "Procure um lugar seguro e calmo para estar",
        "Mantenha-se próximo a pessoas de confiança",
        "Evite tomar decisões importantes neste momento",
        "Lembre-se: estamos aqui para te apoiar",
      ],
    };
  }
}

/*
 * Hero de estado: o pulso de radar da marca, na cor semântica da
 * classificação, com o ícone do estado no centro. Sem números — o
 * resultado é uma leitura de como a pessoa está, não uma nota.
 */
function StatusHero({
  icon: Icon,
  colorClass,
  softBg,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  colorClass: string;
  softBg: string;
}) {
  return (
    <div className={`relative flex h-36 w-36 items-center justify-center ${colorClass}`}>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-current"
          initial={{ scale: 0.62, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.35, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.7 + i * 1.5,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.2 }}
        className={`flex h-24 w-24 items-center justify-center rounded-full ${softBg}`}
      >
        <Icon className="h-11 w-11" strokeWidth={1.8} />
      </motion.div>
    </div>
  );
}

export function ResultScreen({ score, onRestart }: ResultScreenProps) {
  const c = getClassification(score);

  return (
    <>
      <div className="flex flex-1 flex-col justify-center px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
        <div className="flex flex-col items-center text-center">
          <StatusHero icon={c.icon} colorClass={c.colorClass} softBg={c.softBg} />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-6 flex flex-col items-center"
          >
            <p className="kicker mb-2 text-teal">Check-in concluído</p>
            <h1 className="max-w-[17ch] font-display text-[1.6rem] font-semibold leading-snug text-navy">
              {c.title}
            </h1>
            <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-gray-1">
              {c.description}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-9 space-y-3"
        >
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            {c.cardTitle && (
              <p className="mb-2 font-display text-sm font-medium text-navy">{c.cardTitle}</p>
            )}
            <p className="text-sm leading-relaxed text-gray-1">{c.message}</p>
          </div>

          {c.items && (
            <div className="rounded-2xl bg-paper p-5 shadow-sm">
              <p className="mb-3 font-display text-sm font-medium text-navy">{c.itemsTitle}</p>
              <ul className="space-y-2.5">
                {c.items.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.85 + index * 0.07 }}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-navy"
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${c.colorClass}`} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <p className="px-4 pt-1 text-center text-[13px] font-light leading-relaxed text-gray-1">
            Em caso de dúvidas, entre em contato com a Saúde Ocupacional.
          </p>
        </motion.div>
      </div>

      <StickyFooter>
        <SecondaryButton onClick={onRestart}>Fazer nova avaliação</SecondaryButton>
      </StickyFooter>
    </>
  );
}
