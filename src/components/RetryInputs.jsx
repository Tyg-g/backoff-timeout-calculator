import { createEffect, createMemo, createSignal } from "solid-js";
import { NumberInput } from '~/components/UI';

export const defaultRetryInputs = {
  retryCount: 8,
  responseTimeMs: 50,
  initialDelayMs: 125,
  exponentialFactor: 2,
  maxDelayMs: 2000,
  totalTimeoutMs: 30000,
};

const INFINITY_PATTERN = /^inf(?:inity)?$/i;

const formatValue = (value) => {
  if (value === Infinity) {
    return "Infinity";
  }
  return `${value}`;
};

const formatFiniteNumber = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  if (!Number.isFinite(value)) {
    return "";
  }
  return `${value}`;
};

const formatInputs = (values) => ({
  retryCount: formatValue(values.retryCount),
  responseTimeMs: formatFiniteNumber(values.responseTimeMs),
  initialDelayMs: formatFiniteNumber(values.initialDelayMs),
  exponentialFactor: formatFiniteNumber(values.exponentialFactor),
  maxDelayMs: formatFiniteNumber(values.maxDelayMs),
  totalTimeoutMs: formatValue(values.totalTimeoutMs),
});

const parseRetryCountInput = (rawValue) => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: false };
  }
  if (INFINITY_PATTERN.test(trimmed)) {
    return { valid: true, value: Infinity };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { valid: false };
  }
  return { valid: true, value: Math.floor(parsed) };
};

const parseTimeoutInput = (rawValue) => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: false };
  }
  if (INFINITY_PATTERN.test(trimmed)) {
    return { valid: true, value: Infinity };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { valid: false };
  }
  return { valid: true, value: parsed };
};

const parseNonNegativeInput = (rawValue) => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: false };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { valid: false };
  }
  return { valid: true, value: parsed };
};

const parseFactorInput = (rawValue) => {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { valid: false };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false };
  }
  return { valid: true, value: parsed };
};

export default function RetryInputs(props) {
  const mergedValue = createMemo(() => ({
    ...defaultRetryInputs,
    ...props.value,
  }));

  const [rawInputs, setRawInputs] = createSignal(formatInputs(mergedValue()));

  createEffect(() => {
    setRawInputs(formatInputs(mergedValue()));
  });

  const emitChange = (nextValue) => {
    if (typeof props.onChange === "function") {
      props.onChange(nextValue);
    }
  };

  const updateField = (key, value) => {
    const current = mergedValue();
    emitChange({ ...current, [key]: value });
  };

  const handleInput = (key, parser) => (event) => {
    const rawValue = event.currentTarget.value;
    setRawInputs((current) => ({ ...current, [key]: rawValue }));
    const result = parser(rawValue);
    if (result.valid) {
      updateField(key, result.value);
    }
  };

  const value = rawInputs;

  return (
    <section className="bg-base-200 pt-2 pb-5 my-5 px-3">
      <form className="mx-auto max-w-2xl grid grid-flow-col grid-rows-2 gap-x-5 gap-y-1 items-end ">
        <NumberInput
          title="Retry count"
          value={value().retryCount}
          onInput={handleInput("retryCount", parseRetryCountInput)}
        />
        <NumberInput
          title="Response time"
          unit="ms"
          min="0"
          step="50"
          value={value().responseTimeMs}
          onInput={handleInput("responseTimeMs", parseNonNegativeInput)}
        />
        <NumberInput
          title="Initial delay"
          unit="ms"
          min="10"
          step="10"
          value={value().initialDelayMs}
          onInput={handleInput("initialDelayMs", parseNonNegativeInput)}
        />
        <NumberInput
          title="Exponential factor"
          min="0.1"
          step="0.1"
          value={value().exponentialFactor}
          onInput={handleInput("exponentialFactor", parseFactorInput)}
        />
        <NumberInput
          title="Max delay"
          unit="ms"
          min="10"
          step="1000"
          value={value().maxDelayMs}
          onInput={handleInput("maxDelayMs", parseNonNegativeInput)}
        />
        <NumberInput
          title="Total timeout"
          unit="ms"
          value={value().totalTimeoutMs}
          onInput={handleInput("totalTimeoutMs", parseTimeoutInput)}
        />
      </form>
    </section>
  );
}
