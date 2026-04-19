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

// Persistent cache version
const CACHE_VERSION = "v1";
const STORAGE_KEY_PREFIX = `chainify_anomaly_${CACHE_VERSION}_`;

// In-memory map to store active promises (for request deduplication)
const _pendingRequests = new Map();

/**
 * Normalise a description string into a stable cache key.
 */
function _cacheKey(description) {
  return description.trim().toLowerCase();
}

/**
 * Fetch anomaly analysis for a given log / description string.
 */
export async function fetchAnomalyAnalysis(description) {
  if (!description || !description.trim()) {
    return _fallback("No description provided.");
  }

  const key = _cacheKey(description);
  const storageKey = STORAGE_KEY_PREFIX + btoa(unescape(encodeURIComponent(key))).substring(0, 32);

  // 1. Check Persistent Cache (localStorage)
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  // 2. Request Deduplication: Check if there's already an active request
  if (_pendingRequests.has(key)) {
    return _pendingRequests.get(key);
  }

  const performFetch = async () => {
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

      if (!res.ok) throw new Error(`API responded with status ${res.status}`);

      const json = await res.json();
      const result = {
        fraud_probability_score: typeof json.fraud_probability_score === "number" ? json.fraud_probability_score : 0,
        is_law_flagged: Boolean(json.is_law_flagged),
        reasoning: json.compliance_reasoning || json.reasoning || "No reasoning available.",
        status: "success",
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(result));
      } catch (e) {}

      return result;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") return _fallback("Request timed out.");
      return _fallback(err.message || "An unknown error occurred.");
    } finally {
      _pendingRequests.delete(key);
    }
  };

  const requestPromise = performFetch();
  _pendingRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * Return a safe fallback object.
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
 * Clear the anomaly cache.
 */
export function clearAnomalyCache() {
  _pendingRequests.clear();
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

