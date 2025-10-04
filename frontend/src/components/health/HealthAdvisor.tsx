"use client";

import { useState, useMemo } from "react";

interface HealthProfile {
  age: number | null;
  conditions: string[]; // e.g., ["asthma","copd"]
  smoker: boolean;
  sensitiveGroups: boolean; // children/elderly/pregnant
  activityLevel: "low" | "moderate" | "high" | "athlete";
}

interface AdvisoryResult {
  riskScore: number; // 0-100 heuristic
  category: string;
  recommendations: string[];
  triggers: string[]; // which inputs drove the score
}

const CONDITION_CATALOG: { id: string; label: string; weight: number }[] = [
  { id: "asthma", label: "Asthma", weight: 18 },
  { id: "copd", label: "Chronic Lung (COPD)", weight: 22 },
  { id: "cardio", label: "Cardiovascular Disease", weight: 15 },
  { id: "diabetes", label: "Diabetes", weight: 6 },
  { id: "immuno", label: "Immunocompromised", weight: 14 },
];

function computeAdvisory(profile: HealthProfile, aqi: number): AdvisoryResult {
  let risk = 0;
  const triggers: string[] = [];

  // Base from AQI
  if (aqi <= 50) risk += 5;
  else if (aqi <= 100) risk += 15;
  else if (aqi <= 150) risk += 30;
  else if (aqi <= 200) risk += 50;
  else if (aqi <= 300) risk += 70;
  else risk += 85;
  triggers.push(`AQI tier (${aqi})`);

  // Conditions
  profile.conditions.forEach((c) => {
    const def = CONDITION_CATALOG.find((x) => x.id === c);
    if (def) {
      risk += def.weight;
      triggers.push(def.label);
    }
  });

  if (profile.smoker) {
    risk += 10;
    triggers.push("Smoker");
  }
  if (profile.sensitiveGroups) {
    risk += 12;
    triggers.push("Sensitive Group");
  }

  // Activity amplifies exposure
  const activityWeights: Record<HealthProfile["activityLevel"], number> = {
    low: 0,
    moderate: 4,
    high: 9,
    athlete: 14,
  };
  risk += activityWeights[profile.activityLevel];
  if (activityWeights[profile.activityLevel] > 0)
    triggers.push(`Activity: ${profile.activityLevel}`);

  // Age heuristics
  if (profile.age != null) {
    if (profile.age < 12) {
      risk += 8;
      triggers.push("Child");
    } else if (profile.age > 65) {
      risk += 10;
      triggers.push("Senior");
    }
  }

  // Normalize
  risk = Math.min(100, Math.round(risk));

  const category =
    risk < 25
      ? "Low"
      : risk < 45
      ? "Elevated"
      : risk < 65
      ? "High"
      : risk < 85
      ? "Very High"
      : "Severe";

  const recs: string[] = [];
  if (risk >= 60) recs.push("Limit prolonged outdoor exertion");
  if (risk >= 40) recs.push("Prefer N95/FFP2 during peak hours");
  if (risk >= 30) recs.push("Monitor symptoms (cough, wheeze)");
  if (profile.conditions.includes("asthma"))
    recs.push("Carry rescue inhaler and keep action plan handy");
  if (profile.sensitiveGroups)
    recs.push("Use indoor air filtration (HEPA) if available");
  if (aqi > 150) recs.push("Close windows to reduce particulate ingress");
  if (aqi > 200) recs.push("Consider postponing intense training");

  return { riskScore: risk, category, recommendations: recs, triggers };
}

interface HealthAdvisorProps {
  currentAQI: number;
}

export function HealthAdvisor({ currentAQI }: HealthAdvisorProps) {
  const [profile, setProfile] = useState<HealthProfile>({
    age: null,
    conditions: [],
    smoker: false,
    sensitiveGroups: false,
    activityLevel: "moderate",
  });

  const result = useMemo(
    () => computeAdvisory(profile, currentAQI),
    [profile, currentAQI]
  );

  const toggleCondition = (id: string) => {
    setProfile((p) => ({
      ...p,
      conditions: p.conditions.includes(id)
        ? p.conditions.filter((c) => c !== id)
        : [...p.conditions, id],
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-fuchsia-300 to-purple-400">
          Health Exposure Advisor
        </h2>
        <p className="text-white/60 mt-2 max-w-2xl text-sm">
          Enter basic health profile information. A heuristic model (placeholder
          for future AI) estimates exposure sensitivity relative to current AQI
          and provides tailored recommendations. No data is stored.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-1 space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-white font-semibold mb-2">Profile</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-white/70 mb-1">Age</label>
              <input
                type="number"
                min={1}
                max={110}
                value={profile.age ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    age: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                placeholder="e.g. 34"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2">
                Medical Conditions
              </label>
              <div className="flex flex-wrap gap-2">
                {CONDITION_CATALOG.map((c) => {
                  const active = profile.conditions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCondition(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-pink-500/30 border-pink-400/50 text-pink-200"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-white/70 text-xs">
                <input
                  type="checkbox"
                  checked={profile.smoker}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, smoker: e.target.checked }))
                  }
                  className="accent-pink-500"
                />{" "}
                Smoker
              </label>
              <label className="flex items-center gap-2 text-white/70 text-xs">
                <input
                  type="checkbox"
                  checked={profile.sensitiveGroups}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      sensitiveGroups: e.target.checked,
                    }))
                  }
                  className="accent-pink-500"
                />{" "}
                Sensitive Group
              </label>
            </div>
            <div>
              <label className="block text-white/70 mb-1">Activity Level</label>
              <select
                value={profile.activityLevel}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    activityLevel: e.target
                      .value as HealthProfile["activityLevel"],
                  }))
                }
                className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="athlete">Athlete / Intense</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-fuchsia-500/20 border border-fuchsia-400/20 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Personalized Risk
                </h3>
                <p className="text-white/50 text-xs mt-1">
                  Current AQI contextualized using your profile.
                </p>
              </div>
              <div className="flex items-end gap-6">
                <div className="text-center">
                  <div className="text-[10px] text-white/50 tracking-wide">
                    RISK SCORE
                  </div>
                  <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-rose-300 to-purple-400">
                    {result.riskScore}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-white/50 tracking-wide">
                    CATEGORY
                  </div>
                  <div className="text-xl font-bold text-white">
                    {result.category}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-white/50 tracking-wide">
                    AQI
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {currentAQI}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 h-3 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${result.riskScore}%`,
                  background: "linear-gradient(90deg,#ec4899,#a855f7,#6366f1)",
                }}
              />
            </div>
            <div className="mt-2 text-[10px] text-white/40">
              Heuristic scoring (0–100). Future: ML / AI model integrating
              multi-pollutant dose and meteorology.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h4 className="text-white font-semibold mb-3 text-sm">
                Primary Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-white/70 list-disc pl-4">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
                {result.recommendations.length === 0 && (
                  <li className="text-white/40">
                    No special actions required at this time.
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h4 className="text-white font-semibold mb-3 text-sm">
                Risk Drivers
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.triggers.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-200 text-[10px] font-medium border border-pink-400/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-600/10 via-fuchsia-600/10 to-indigo-600/10 border border-pink-400/20 rounded-2xl p-5">
            <p className="text-[11px] text-white/50 leading-relaxed">
              Disclaimer: This feature provides generalized wellness guidance,
              not medical advice. Consult a healthcare professional for clinical
              decisions. Future iteration will incorporate AI-driven
              personalized exposure forecasting using longitudinal symptom +
              pollutant histories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
