"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Banner({
  src,
  alt,
  kicker,
  heading,
  subtext,
  id,
}: {
  src: string;
  alt: string;
  kicker: string;
  heading: ReactNode;
  subtext: string;
  id?: string;
}) {
  return (
    <section className="relative overflow-hidden min-h-[420px] sm:min-h-[460px] flex items-center" id={id}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <Image src={src} alt={alt} fill priority={false} sizes="100vw" className="object-cover" />
      </motion.div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(13,15,43,.92) 0%, rgba(13,15,43,.72) 38%, rgba(36,48,216,.35) 72%, rgba(236,72,153,.28) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1180px] px-6 py-20 w-full">
        <motion.div
          className="max-w-[46ch]"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-sky-lt">
            {kicker}
          </span>
          <h2 className="text-white text-[30px] sm:text-[40px] md:text-[46px] tracking-[-0.025em] mt-3">
            {heading}
          </h2>
          <p className="text-[#D7DAF2] text-lg mt-4">{subtext}</p>
        </motion.div>
      </div>
    </section>
  );
}
