"use client"

/**
 * AnomalyInsight.jsx
 * --------------------------------------------------
 * Reusable, non-intrusive UI component that displays AI-powered
 * anomaly-detection insights for a given description text.
 *
 * Features:
 *   – Colour-coded fraud-probability gauge bar
 *   – Legal-flag warning badge
 *   – Expandable reasoning section
 *   – Loading skeleton state
 *   – Graceful error fallback
 *
 * Props:
 *   @param {object|null} analysis   – Result from fetchAnomalyAnalysis()
 *   @param {boolean}     loading    – Whether the analysis is being fetched
 *   @param {boolean}     compact    – Optional. Renders a minimal inline badge
 * --------------------------------------------------
 */

import { useState } from "react"
import {
  FiShield,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiInfo,
  FiCheckCircle,
  FiXOctagon,
} from "react-icons/fi"

// ── Helpers ──────────────────────────────────────────

/** Map a 0-100 fraud score to a severity level. */
function getSeverity(score) {
  if (score <= 25) return { label: "Low Risk", color: "emerald", emoji: "✓" }
  if (score <= 50) return { label: "Moderate", color: "amber", emoji: "!" }
  if (score <= 75) return { label: "Elevated", color: "orange", emoji: "!!" }
  return { label: "High Risk", color: "red", emoji: "⚠" }
}

/** Tailwind-safe colour maps (can't interpolate dynamic strings in Tailwind). */
const colorMap = {
  emerald: {
    bg:     "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text:   "text-emerald-400",
    bar:    "bg-emerald-500",
    glow:   "shadow-[0_0_12px_rgba(16,185,129,0.3)]",
  },
  amber: {
    bg:     "bg-amber-500/10",
    border: "border-amber-500/30",
    text:   "text-amber-400",
    bar:    "bg-amber-500",
    glow:   "shadow-[0_0_12px_rgba(245,158,11,0.3)]",
  },
  orange: {
    bg:     "bg-orange-500/10",
    border: "border-orange-500/30",
    text:   "text-orange-400",
    bar:    "bg-orange-500",
    glow:   "shadow-[0_0_12px_rgba(249,115,22,0.3)]",
  },
  red: {
    bg:     "bg-red-500/10",
    border: "border-red-500/30",
    text:   "text-red-400",
    bar:    "bg-red-500",
    glow:   "shadow-[0_0_12px_rgba(239,68,68,0.3)]",
  },
}

// ── Component ────────────────────────────────────────

export default function AnomalyInsight({ analysis, loading, compact = false }) {
  const [expanded, setExpanded] = useState(false)

  // ── Loading skeleton ───────────────────────────────
  if (loading) {
    return (
      <div className="anomaly-insight-container flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 animate-pulse">
        <FiLoader className="text-lg text-slate-500 animate-spin" />
        <span className="text-sm text-slate-500 font-medium">Running AI anomaly analysis…</span>
      </div>
    )
  }

  // ── No analysis yet (nothing to show) ──────────────
  if (!analysis) return null

  // ── Error fallback ─────────────────────────────────
  if (analysis.status === "error") {
    return (
      <div className="anomaly-insight-container flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <FiInfo className="text-lg text-slate-500 shrink-0" />
        <span className="text-sm text-slate-500 font-medium">
          AI analysis unavailable{analysis.error ? `: ${analysis.error}` : ""}
        </span>
      </div>
    )
  }

  const score = analysis.fraud_probability_score ?? 0
  const flagged = analysis.is_law_flagged
  const reasoning = analysis.reasoning
  const severity = getSeverity(score)
  const colors = colorMap[severity.color]

  // ── Compact badge mode (inline within history items) ──
  if (compact) {
    return (
      <div className="anomaly-insight-compact flex items-center gap-2 flex-wrap mt-2">
        {/* Fraud score pill */}
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}
          title={`Fraud probability: ${score}%`}
        >
          <FiShield className="text-xs" />
          {score}% – {severity.label}
        </span>

        {/* Legal flag pill */}
        {flagged && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 anomaly-pulse">
            <FiAlertTriangle className="text-xs" />
            Legal Flag
          </span>
        )}

        {/* Not flagged – clean pill */}
        {!flagged && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="text-xs" />
            Compliant
          </span>
        )}
      </div>
    )
  }

  // ── Full card mode ─────────────────────────────────
  return (
    <div className={`anomaly-insight-container rounded-3xl border ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 anomaly-fade-in`}>
      {/* Header row */}
      <div className="flex items-center justify-between p-5 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 ${colors.glow}`}>
            {flagged ? <FiXOctagon className="text-lg" /> : <FiShield className="text-lg" />}
          </div>

          {/* Score & label */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-black ${colors.text}`}>
                {score}%
              </span>
              <span className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>
                {severity.label}
              </span>
            </div>

            {/* Gauge bar */}
            <div className="w-48 h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          {flagged && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 anomaly-pulse">
              <FiAlertTriangle className="text-xs" />
              Legal Flag
            </span>
          )}
          {!flagged && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FiCheckCircle className="text-xs" />
              Compliant
            </span>
          )}

          {/* Expand toggle */}
          {reasoning && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
              title={expanded ? "Collapse reasoning" : "View reasoning"}
            >
              {expanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable reasoning */}
      {expanded && reasoning && (
        <div className="px-5 pb-5 anomaly-fade-in">
          <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
            <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 flex items-center gap-2">
              <FiInfo className="text-xs" />
              AI Reasoning
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {reasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
