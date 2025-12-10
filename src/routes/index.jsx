import { Title } from "@solidjs/meta";
import { For, Show, createMemo, createSignal, lazy } from "solid-js";

import RetryInputs, { defaultRetryInputs } from "~/components/RetryInputs";

import computeTimeline from "~/modules/compute-timeline.mjs";

export default function Home() {
  const [inputs, setInputs] = createSignal(defaultRetryInputs);
  const result = createMemo( () => computeTimeline(inputs()) );

  const timeline = () => result().timeline ?? [];
  const totalRetries = () => result().totalRetries ?? 0;
  const totalTimeMs = () => result().totalTimeMs ?? 0;

  const LazyTimelineGraph = lazy( () => import("~/components/Chart") );

  return (
    <main>
      <RetryInputs value={inputs()} onChange={setInputs} />
      <div className='h-50 my-10 mx-1'>
        <LazyTimelineGraph />
      </div>
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
