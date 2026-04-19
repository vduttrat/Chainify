/**
 * anomalyService.js
 * --------------------------------------------------
 * Self-contained service for the Chainify AI anomaly-detection API.
 *
 * • GET  https://chainify-anomaly-detection.azurewebsites.net/flag?msg=<text>
 * • Response fields we care about:
 *     - fraud_probability_score  (number, 0-100)
 *     - is_law_flagged           (boolean)
 *     - compliance_reasoning     (string)
 *
 * Includes:
 *   – In-memory cache keyed on the raw description string (avoids redundant calls)
 *   – AbortController-based 15-second timeout
 *   – Graceful fallback on any failure
 * --------------------------------------------------
 */

const API_BASE = "https://chainify-anomaly-detection.azurewebsites.net";
const TIMEOUT_MS = 15_000; // 15 seconds

// Simple in-memory cache: description → analysis result
const _cache = new Map();

/**
 * Normalise a description string into a stable cache key.
 * Trims whitespace and lowercases so minor variations don't bust the cache.
 */
function _cacheKey(description) {
  return description.trim().toLowerCase();
}

/**
 * Fetch anomaly analysis for a given log / description string.
 *
 * @param {string} description – The employee-submitted text
 * @returns {Promise<{
 *   fraud_probability_score: number,
 *   is_law_flagged: boolean,
 *   reasoning: string,
 *   status: 'success' | 'error',
 *   error?: string
 * }>}
 */
export async function fetchAnomalyAnalysis(description) {
  if (!description || !description.trim()) {
    return _fallback("No description provided.");
  }

  // ── Cache hit ────────────────────────────────────────
  const key = _cacheKey(description);
  if (_cache.has(key)) {
    return _cache.get(key);
  }

  // ── API call with timeout ────────────────────────────
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = new URL("/flag", API_BASE);
    url.searchParams.set("msg", description.trim());

    const res = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const json = await res.json();

    // ── Parse & normalise ────────────────────────────────
    const result = {
      fraud_probability_score:
        typeof json.fraud_probability_score === "number"
          ? json.fraud_probability_score
          : 0,
      is_law_flagged: Boolean(json.is_law_flagged),
      // The API returns "compliance_reasoning" but we expose as "reasoning"
      reasoning:
        json.compliance_reasoning ||
        json.reasoning ||
        "No reasoning available.",
      status: "success",
    };

    // ── Cache the result ─────────────────────────────────
    _cache.set(key, result);
    return result;
  } catch (err) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      return _fallback("Request timed out. Please try again.");
    }
    return _fallback(err.message || "An unknown error occurred.");
  }
}

/**
 * Return a safe fallback object so the UI can always render.
 */
function _fallback(errorMessage) {
  return {
    fraud_probability_score: null,
    is_law_flagged: null,
    reasoning: null,
    status: "error",
    error: errorMessage,
  };
}

/**
 * Clear the in-memory anomaly cache (useful in testing or manual refresh).
 */
export function clearAnomalyCache() {
  _cache.clear();
}
