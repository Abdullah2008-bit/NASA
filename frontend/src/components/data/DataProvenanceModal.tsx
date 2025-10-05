"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DataProvenanceModalProps {
  open: boolean;
  onClose: () => void;
}

/*
  Data Provenance & Attribution Modal
  Explains how the fused AQI is constructed, source hierarchy, current limitations, and roadmap.
*/
export function DataProvenanceModal({
  open,
  onClose,
}: DataProvenanceModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Data Provenance"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="relative w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 shadow-2xl text-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500">
                Data Provenance & Attribution
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6 leading-relaxed text-gray-300 max-h-[65vh] overflow-y-auto pr-2 custom-scroll">
              <section>
                <h3 className="font-semibold text-white mb-2">Fusion Logic</h3>
                <p>
                  The platform fuses{" "}
                  <strong>ground measurements (OpenAQ)</strong> with
                  <strong> satellite estimates (TEMPO mock placeholder)</strong>
                  . For any location, we prioritize the nearest high-quality
                  ground station readings (PM2.5, O₃, NO₂). If a pollutant is
                  missing from ground data, we fall back to the satellite proxy.
                </p>
                <ul className="mt-2 list-disc list-inside text-gray-400 space-y-1">
                  <li>Ground &gt; Satellite precedence per pollutant</li>
                  <li>
                    Up to 3 nearby stations evaluated (radius configurable)
                  </li>
                  <li>
                    Subindices computed using US EPA breakpoints (PM2.5, O₃(8h),
                    NO₂(1h))
                  </li>
                  <li>
                    Dominant pollutant = highest subindex (rounded AQI value)
                  </li>
                </ul>
              </section>
              <section>
                <h3 className="font-semibold text-white mb-2">
                  Current Data Status
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="font-medium text-blue-300 mb-1">
                      OpenAQ (Live)
                    </p>
                    <p className="text-gray-400">
                      Real ground station data for PM₂.₅, O₃, NO₂ (and others
                      when extended).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="font-medium text-amber-300 mb-1">
                      TEMPO (Mock)
                    </p>
                    <p className="text-gray-400">
                      Currently mocked placeholder. Real ingestion via
                      earthaccess planned next.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="font-medium text-green-300 mb-1">
                      AQI Engine
                    </p>
                    <p className="text-gray-400">
                      Deterministic EPA breakpoint interpolation with pollutant
                      subindices.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="font-medium text-purple-300 mb-1">
                      Health Advisor
                    </p>
                    <p className="text-gray-400">
                      Uses dominant pollutant and relative subindex weights for
                      guidance.
                    </p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="font-semibold text-white mb-2">
                  Planned Enhancements
                </h3>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Real TEMPO L2 product retrieval + geospatial binning</li>
                  <li>
                    Temporal rolling windows for O₃ 8‑hour averaging accuracy
                  </li>
                  <li>
                    Additional pollutant support: SO₂, CO, PM₁₀, HCHO weighting
                  </li>
                  <li>Quality flags + anomaly detection & provenance badges</li>
                  <li>Historical persistence + forecast integration</li>
                </ul>
              </section>
              <section>
                <h3 className="font-semibold text-white mb-2">Disclaimers</h3>
                <p className="text-orange-300/90 text-xs">
                  This is an in-progress hackathon build. Satellite inputs are
                  partially mocked. Do not use for medical decisions. Real
                  ingestion & validation pipeline forthcoming.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-white mb-2">Attribution</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>NASA (TEMPO Mission & Earthdata Program)</li>
                  <li>OpenAQ Community Data</li>
                  <li>EPA AQI Breakpoint Reference</li>
                  <li>Future: NOAA, MERRA‑2, IMERG, Pandora, TOLNet</li>
                </ul>
              </section>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Close
              </button>
              <a
                href="https://github.com/Abdullah2008-bit/NASA"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow shadow-blue-700/30"
              >
                View Source
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
