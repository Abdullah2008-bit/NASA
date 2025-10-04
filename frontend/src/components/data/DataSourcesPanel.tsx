import React from "react";
import { motion } from "framer-motion";

interface DataSource {
  name: string;
  satellite: string;
  parameters: string[];
  resolution: string;
  frequency: string;
  status: "active" | "processing" | "standby";
  lastUpdate: string;
  coverage: string;
}

const DATA_SOURCES: DataSource[] = [
  {
    name: "TEMPO",
    satellite: "Geostationary (35,786 km)",
    parameters: ["NO₂", "O₃", "HCHO", "SO₂", "Aerosol Index"],
    resolution: "2.1 × 4.7 km",
    frequency: "Hourly (Daytime)",
    status: "active",
    lastUpdate: "12 minutes ago",
    coverage: "North America",
  },
  {
    name: "MERRA-2",
    satellite: "Model Reanalysis",
    parameters: [
      "Wind (U/V)",
      "Temperature",
      "Pressure",
      "Humidity",
      "PBL Height",
    ],
    resolution: "0.5° × 0.625°",
    frequency: "1-hour",
    status: "active",
    lastUpdate: "8 minutes ago",
    coverage: "Global",
  },
  {
    name: "GOES-R ABI",
    satellite: "GOES-16/17 (35,786 km)",
    parameters: [
      "Aerosol Optical Depth",
      "True Color",
      "Cloud Mask",
      "Fire Detection",
    ],
    resolution: "2 km (visible)",
    frequency: "15 minutes",
    status: "active",
    lastUpdate: "3 minutes ago",
    coverage: "Americas",
  },
  {
    name: "OpenAQ",
    satellite: "Ground Stations",
    parameters: ["PM2.5", "PM10", "O₃", "NO₂", "SO₂", "CO"],
    resolution: "Point measurements",
    frequency: "Real-time",
    status: "active",
    lastUpdate: "1 minute ago",
    coverage: "10,000+ stations worldwide",
  },
];

export function DataSourcesPanel() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              NASA Earth Observation Data Sources
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              Real-time integration with NASA&apos;s Earth Science missions
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-300">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="p-6 space-y-4">
        {DATA_SOURCES.map((source, index) => (
          <motion.div
            key={source.name}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-white">
                    {source.name}
                  </h4>
                  <StatusBadge status={source.status} />
                </div>
                <p className="text-sm text-slate-400">{source.satellite}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Last Update</div>
                <div className="text-sm font-semibold text-cyan-400">
                  {source.lastUpdate}
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                PARAMETERS
              </div>
              <div className="flex flex-wrap gap-2">
                {source.parameters.map((param) => (
                  <span
                    key={param}
                    className="px-2 py-1 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium rounded"
                  >
                    {param}
                  </span>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">Resolution</div>
                <div className="font-semibold text-white">
                  {source.resolution}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Frequency</div>
                <div className="font-semibold text-white">
                  {source.frequency}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Coverage</div>
                <div className="font-semibold text-white">
                  {source.coverage}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            Data provided by NASA Earthdata Cloud •{" "}
            <a
              href="https://earthdata.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              earthdata.nasa.gov
            </a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-slate-400">Live Data Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DataSource["status"] }) {
  const config = {
    active: {
      bg: "bg-green-500/20",
      border: "border-green-400/30",
      text: "text-green-300",
      dot: "bg-green-400",
      label: "Active",
    },
    processing: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-400/30",
      text: "text-yellow-300",
      dot: "bg-yellow-400",
      label: "Processing",
    },
    standby: {
      bg: "bg-slate-500/20",
      border: "border-slate-400/30",
      text: "text-slate-300",
      dot: "bg-slate-400",
      label: "Standby",
    },
  }[status];

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 ${config.bg} border ${config.border} rounded-full`}
    >
      <div className={`w-1.5 h-1.5 ${config.dot} rounded-full animate-pulse`} />
      <span className={`text-xs font-semibold ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}
