"use client";
import { motion } from "framer-motion";

export const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span key={`${word}-${i}`} className="inline-block mr-2"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.08 }}>
          {word}
        </motion.span>
      ))}
    </span>
  );
};
