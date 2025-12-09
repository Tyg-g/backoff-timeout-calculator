const sanitizeRetryCount = (value) => {
  if (value === Infinity) {
    return Infinity;
  }
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return 0;
  }
  return Math.max(0, Math.floor(next));
};

const sanitizeTimeoutMs = (value) => {
  if (value === Infinity) {
    return Infinity;
  }
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return 0;
  }
  return Math.max(0, next);
};

const sanitizeNonNegativeMs = (value) => {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return 0;
  }
  return Math.max(0, next);
};

const sanitizeFactor = (value) => {
  const next = Number(value);
  if (!Number.isFinite(next) || next <= 0) {
    return 1;
  }
  return next;
};

export default function computeTimeline(input = {}) {
  const safeInput = {
    retryCount: sanitizeRetryCount(input.retryCount),
    responseTimeMs: sanitizeNonNegativeMs(input.responseTimeMs),
    initialDelayMs: sanitizeNonNegativeMs(input.initialDelayMs),
    exponentialFactor: sanitizeFactor(input.exponentialFactor),
    maxDelayMs: sanitizeNonNegativeMs(input.maxDelayMs),
    totalTimeoutMs: sanitizeTimeoutMs(input.totalTimeoutMs),
  };

  if (safeInput.retryCount === 0) {
    return { timeline: [], totalRetries: 0, totalTimeMs: 0 };
  }

  const maxAttempts = Number.isFinite(safeInput.retryCount)
    ? safeInput.retryCount
    : Infinity;
  const timeoutLimitMs = Number.isFinite(safeInput.totalTimeoutMs)
    ? safeInput.totalTimeoutMs
    : Infinity;

  const timeline = [];
  let attempt = 0;
  let elapsedMs = 0;
  const MAX_ITERATIONS = 1000;

  while (
    attempt < maxAttempts &&
    elapsedMs <= timeoutLimitMs &&
    attempt < MAX_ITERATIONS
  ) {
    attempt += 1;
    const entry = {
      attempt,
      timestampMs: elapsedMs,
      delayAfterMs: 0,
    };
    timeline.push(entry);

    elapsedMs += safeInput.responseTimeMs;

    if (elapsedMs >= timeoutLimitMs) {
      entry.delayAfterMs = 0;
      break;
    }

    if (attempt >= maxAttempts) {
      entry.delayAfterMs = 0;
      break;
    }

    const exponentialDelayMs = safeInput.initialDelayMs *
      Math.pow(safeInput.exponentialFactor, attempt - 1);
    const boundedDelayMs = Math.min(safeInput.maxDelayMs, exponentialDelayMs);
    const finalDelayMs = Number.isFinite(boundedDelayMs)
      ? Math.max(0, boundedDelayMs)
      : safeInput.maxDelayMs;

    if (elapsedMs + finalDelayMs > timeoutLimitMs) {
      entry.delayAfterMs = Math.max(0, timeoutLimitMs - elapsedMs);
      elapsedMs = timeoutLimitMs;
      break;
    }

    entry.delayAfterMs = finalDelayMs;
    elapsedMs += finalDelayMs;
  }

  return {
    timeline,
    totalRetries: timeline.length,
    totalTimeMs: Math.min(elapsedMs, timeoutLimitMs),
  };
}
