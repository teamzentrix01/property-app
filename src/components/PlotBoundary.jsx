"use client";

import { motion } from "framer-motion";

// Signature element: an animated land-survey boundary line drawing itself,
// echoing the plot/property-measurement theme the whole product is built on.
export default function PlotBoundary({ className = "" }) {
  const points = "20,180 20,60 110,20 220,45 260,140 190,190 90,175";

  return (
    <svg viewBox="0 0 280 210" className={className} fill="none">
      <motion.polygon
        points={points}
        stroke="var(--gold)"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
      {points.split(" ").map((p, i) => {
        const [x, y] = p.split(",");
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="var(--gold)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.22, duration: 0.3 }}
          />
        );
      })}
    </svg>
  );
}
