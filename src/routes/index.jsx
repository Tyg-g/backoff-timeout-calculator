import { Title } from "@solidjs/meta";
import { For, Show, createMemo, createSignal } from "solid-js";

import RetryInputs, { defaultRetryInputs } from "~/components/RetryInputs";
import computeTimeline from "~/modules/compute-timeline.mjs";

export default function Home() {
  const [inputs, setInputs] = createSignal(defaultRetryInputs);
  const result = createMemo(() => computeTimeline(inputs()));

  const timeline = () => result().timeline;
  const totalRetries = () => result().totalRetries;
  const totalTimeMs = () => result().totalTimeMs;

  return (
    <main>
      <Title>Retry Timeout Calculator</Title>
      <h1>Retry Timeout Calculator</h1>
      <RetryInputs value={inputs()} onChange={setInputs} />
      <section>
        <h2>Results</h2>
        <p>Total retries: {totalRetries()}</p>
        <p>Total time (ms): {totalTimeMs()}</p>
        <Show when={timeline().length} fallback={<p>No data.</p>}>
          <table>
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Timestamp (ms)</th>
                <th>Delay After (ms)</th>
              </tr>
            </thead>
            <tbody>
              <For each={timeline()}>
                {(entry) => (
                  <tr>
                    <td>{entry.attempt}</td>
                    <td>{Math.round(entry.timestampMs)}</td>
                    <td>{Math.round(entry.delayAfterMs)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </section>
    </main>
  );
}
