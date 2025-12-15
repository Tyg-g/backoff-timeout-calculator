import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { useLocation } from "@solidjs/router";

import { NumberInput } from "~/components/UI";


export const defaultRetryInputs = {
  retryCount: 10,
  responseTimeMs: 25,
  initialDelayMs: 125,
  exponentialFactor: 2,
  maxDelayMs: 5000,
  totalTimeoutMs: Infinity,
};


export default function RetryInputs(props) {
  const location = useLocation();

  const mergedValue = createMemo(() => ({
    ...defaultRetryInputs,
    ...props.value,
  }));

  const [inputs, setInputs] = createSignal(mergedValue());
  const toSeconds = (value) => (Number.isFinite(value) ? Math.round(value / 1000) : value);
  const toMilliseconds = (value) => (Number.isFinite(value) ? value * 1000 : value);

  onMount(() => {
    if (isServer) return;

    const q = location.query;
    const qInput = {};

    for (const key of Object.keys(defaultRetryInputs)) {
      const raw = q[key];
      if (raw==null) continue;

      const val = parseQueryNumber(raw, key);

      if (val != null) {
        console.log(`Query input '${key}' = ${raw}`);
        qInput[key] = val;
      }
    }//for

    const next = {
      ...inputs(),
      ...qInput,
    };

    setInputs(next);
    emitChange(next);
  });

  createEffect(() => {
    setInputs(mergedValue());
  });

  const emitChange = (nextValue) => {
    if (typeof props.onChange === "function") {
      if (Number.isFinite(nextValue.totalTimeoutMs) || Number.isFinite(nextValue.retryCount)) {
        props.onChange(nextValue);
      }
    }
  };

  let retryCountControl;
  let totalTimeoutControl;

  const resolveInfinityConflict = (key, nextValue) => {
    if (nextValue !== Infinity) {
      return;
    }

    const snapshot = inputs();
    if (key === "retryCount" && snapshot.totalTimeoutMs === Infinity) {
      totalTimeoutControl?.clearInfinity();
      return;
    }

    if (key === "totalTimeoutMs" && snapshot.retryCount === Infinity) {
      retryCountControl?.clearInfinity();
      return;
    }
  };

  const handleChange = (key) => (nextValue) => {
    if (Number.isNaN(nextValue)) {
      return;
    }

    resolveInfinityConflict(key, nextValue);

    const normalizedValue = key === "totalTimeoutMs" ? toMilliseconds(nextValue) : nextValue;

    const nextState = { ...inputs(), [key]: normalizedValue };

    setInputs(nextState);
    emitChange(nextState);
  };

  const value = inputs;

  return (
    <section className="bg-base-200 pt-2 pb-5 my-5 px-3">
      <form className="mx-auto max-w-2xl grid grid-flow-col grid-rows-2 gap-x-5 gap-y-1 items-end ">
        <NumberInput
          title="Retry count"
          name="retry-count"
          min="0"
          step="1"
          allowInf
          initialFinite={10}
          value={value().retryCount}
          onChange={handleChange("retryCount")}
          ref={(api) => {
            retryCountControl = api;
          }}
        />
        <NumberInput
          title="Response time"
          name="response-time"
          unit="ms"
          min="0"
          step="50"
          value={value().responseTimeMs}
          onChange={handleChange("responseTimeMs")}
        />
        <NumberInput
          title="Initial delay"
          name="initial-delay"
          unit="ms"
          min="10"
          step="10"
          value={value().initialDelayMs}
          onChange={handleChange("initialDelayMs")}
        />
        <NumberInput
          title="Exponential factor"
          name="exponential-factor"
          min="1"
          step="0.5"
          value={value().exponentialFactor}
          onChange={handleChange("exponentialFactor")}
        />
        <NumberInput
          title="Max delay"
          name="max-delay"
          unit="ms"
          min="10"
          step="1000"
          value={value().maxDelayMs}
          onChange={handleChange("maxDelayMs")}
        />
        <NumberInput
          title="Total timeout"
          name="total-timeout"
          unit="s"
          min="1"
          step="10"
          allowInf
          initialFinite={30}
          value={toSeconds(value().totalTimeoutMs)}
          onChange={handleChange("totalTimeoutMs")}
          ref={(api) => {
            totalTimeoutControl = api;
          }}
        />
      </form>
    </section>
  );
}


function parseQueryNumber(raw, key) {
  const mins = {
    retryCount: 0,
    responseTimeMs: 0,
    initialDelayMs: 1,
    exponentialFactor: 1.0,
    maxDelayMs: 10,
    totalTimeoutMs: 1000,
  };

  const digits = /^[0-9.]+$/;
  if (!digits.test(raw)) return undefined;

  let value = parseFloat(raw);

  if (key === 'totalTimeoutMs') {
    value = Math.round(value / 1000) * 1000;
  }
  else if (key === 'exponentialFactor') {
    value = Math.round(value * 10) / 10;
  }
  else {
    value = Math.round(value);
  }

  value = Math.max(mins[key], value);

  return isNaN(value) ? undefined : value;
}
