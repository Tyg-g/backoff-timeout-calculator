import { DEV } from 'solid-js';
import z from "zod";


let timelineInputSchema;

if (DEV) {
  timelineInputSchema = z.object({
    retryCount: z.union([z.number().nonnegative(), z.literal(Infinity)]),
    responseTimeMs: z.number().nonnegative(),
    initialDelayMs: z.number().positive(),
    exponentialFactor: z.number().positive(),
    maxDelayMs: z.number().positive(),
    totalTimeoutMs: z.union([z.number().positive(), z.literal(Infinity)]),
  })
    .superRefine((value, ctx) => {
      if (value.retryCount === Infinity && value.totalTimeoutMs === Infinity) {
        ctx.addIssue({
          code: 'custom',
          message: `Cannot be both 'retryCount' and 'totalTimeoutMs' Infinity`,
        });
      }
    });
}

export default function computeTimeline(input) {
  if (!input) {
    throw new Error("computeTimeline requires input values");
  }

  if (DEV) {
    const res = timelineInputSchema.safeParse(input);
    if (res.error) {
      console.error(res.error);
      return;
    }
  }

  const {
    retryCount,
    responseTimeMs,
    initialDelayMs,
    exponentialFactor,
    maxDelayMs,
    totalTimeoutMs,
  } = input;

  const timeline = [];

  let attempt = 0;
  let elapsedMs = 0;
  let currentDelay = initialDelayMs / exponentialFactor;
  let safetyLimit = false;

  const MAX_ITERATIONS = 1000;
  const MAX_ELAPSED_MS = 4*3600*1000;

  const maxAttempts = Math.min(retryCount + 1, MAX_ITERATIONS);
  const timeLimitMs = Math.min(totalTimeoutMs, MAX_ELAPSED_MS);

  while (
    attempt < maxAttempts &&
    elapsedMs <= timeLimitMs
  ) {
    attempt += 1;
    const entry = {
      attempt,
      timestampMs: elapsedMs,
      delayAfterMs: 0,
    };
    timeline.push(entry);

    elapsedMs += responseTimeMs;

    if (elapsedMs >= timeLimitMs || attempt >= maxAttempts){
      if (attempt >= MAX_ITERATIONS || elapsedMs >= MAX_ELAPSED_MS)
        safetyLimit = true;
      break;
    }

    if (currentDelay < maxDelayMs)
      currentDelay = Math.min(currentDelay * exponentialFactor, maxDelayMs);

    if (elapsedMs + currentDelay > timeLimitMs) {
      entry.delayAfterMs = Math.max(0, timeLimitMs - elapsedMs);
      elapsedMs = timeLimitMs;
      break;
    }

    entry.delayAfterMs = currentDelay;
    elapsedMs += currentDelay;

    if (elapsedMs >= MAX_ELAPSED_MS)
      safetyLimit = true;
  }

  return {
    responseTimeMs,
    timeline,
    totalRetries: timeline.length - 1,
    totalTimeMs: Math.min(elapsedMs, timeLimitMs),
    safetyLimit,
  };
}
