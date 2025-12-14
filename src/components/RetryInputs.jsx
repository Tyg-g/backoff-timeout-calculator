import { createEffect, createMemo, createSignal } from "solid-js";
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
  const mergedValue = createMemo(() => ({
    ...defaultRetryInputs,
    ...props.value,
  }));

  const [inputs, setInputs] = createSignal(mergedValue());

  createEffect(() => {
    setInputs(mergedValue());
  });

  const emitChange = (nextValue) => {
    if (typeof props.onChange === "function") {
      props.onChange(nextValue);
    }
  };

  let retryCountControl;
  let totalTimeoutControl;

  const handleChange = (key) => (nextValue) => {
    if (Number.isNaN(nextValue)) {
      return;
    }

    const current = inputs();
    const nextState = { ...current, [key]: nextValue };

    if (nextValue === Infinity) {
      if (key === "retryCount" && current.totalTimeoutMs === Infinity) {
        totalTimeoutControl?.clearInfinity(defaultRetryInputs.totalTimeoutMs);
        nextState.totalTimeoutMs = defaultRetryInputs.totalTimeoutMs;
      } else if (key === "totalTimeoutMs" && current.retryCount === Infinity) {
        retryCountControl?.clearInfinity(defaultRetryInputs.retryCount);
        nextState.retryCount = defaultRetryInputs.retryCount;
      }
    }

    setInputs(nextState);
    emitChange(nextState);
  };

  const value = inputs;

  return (
    <section className="bg-base-200 pt-2 pb-5 my-5 px-3">
      <form className="mx-auto max-w-2xl grid grid-flow-col grid-rows-2 gap-x-5 gap-y-1 items-end ">
        <NumberInput
          title="Retry count"
          min="0"
          step="1"
          allowInf
          value={value().retryCount}
          onChange={handleChange("retryCount")}
          ref={(api) => {
            retryCountControl = api;
          }}
        />
        <NumberInput
          title="Response time"
          unit="ms"
          min="0"
          step="50"
          value={value().responseTimeMs}
          onChange={handleChange("responseTimeMs")}
        />
        <NumberInput
          title="Initial delay"
          unit="ms"
          min="10"
          step="10"
          value={value().initialDelayMs}
          onChange={handleChange("initialDelayMs")}
        />
        <NumberInput
          title="Exponential factor"
          min="1"
          step="0.5"
          value={value().exponentialFactor}
          onChange={handleChange("exponentialFactor")}
        />
        <NumberInput
          title="Max delay"
          unit="ms"
          min="10"
          step="1000"
          value={value().maxDelayMs}
          onChange={handleChange("maxDelayMs")}
        />
        <NumberInput
          title="Total timeout"
          unit="ms"
          min="1"
          allowInf
          value={value().totalTimeoutMs}
          onChange={handleChange("totalTimeoutMs")}
          ref={(api) => {
            totalTimeoutControl = api;
          }}
        />
      </form>
    </section>
  );
}
