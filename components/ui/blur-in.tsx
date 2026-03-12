"use client";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export const BlurIn = ({ children, delay = 0 }: PropsWithChildren<{ delay?: number }>) => (
  <motion.div
    initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);
