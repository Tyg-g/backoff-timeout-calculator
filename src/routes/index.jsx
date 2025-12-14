import { Title } from "@solidjs/meta";
import { For, Show, createMemo, createSignal, createEffect, lazy } from "solid-js";
import { createStore } from "solid-js/store";

import RetryInputs, { defaultRetryInputs } from "~/components/RetryInputs";
import { Table, Toggle } from "~/components/UI";
import ChartSkeleton from "~/components/ChartSkeleton";

import computeTimeline from "~/modules/compute-timeline.mjs";


export default function CalculatorPage() {
  const [inputs, setInputs] = createSignal(defaultRetryInputs);
  const result = createMemo( () => computeTimeline(inputs()) );

  const timeline = () => result().timeline ?? [];
  const totalRetries = () => result().totalRetries ?? 0;
  const totalTimeMs = () => result().totalTimeMs ?? 0;
  const stopReasonRetries = () => totalRetries() >= inputs().retryCount;

  const [shows, setShows] = createStore({ table: false, bargraph: true });

  const LazyTimelineGraph = lazy( () => import("~/components/TimelineChart") );
  const LazyBarGraph =      lazy( () => import("~/components/BarGraph") );

  createEffect(() => {
    //console.log(inputs().retires);
  });

  return (
    <main>
      <RetryInputs value={inputs()} onChange={setInputs} />
      <ChartSkeleton />
      <output className='block px-2 w-170 my-10 mx-auto text-sm'>
        <div className='text-gray-300 mb-2 mr-8 inline-block'>
          Retry count:
          <span className='text-blue-600 font-bold text-lg ml-3'>{totalRetries()}</span>
          {stopReasonRetries() && <span className='inline-block w-0'>⌞</span>}
        </div>
        <div className='text-gray-300  inline-block'>
          Total time:
          <span className='text-green-600 font-bold text-lg ml-3'>{totalTimeMs()}ms</span>
          {(!stopReasonRetries()) && <span className='inline-block w-0'>⌞</span>}
        </div>
      </output>
      <div className='h-50 my-10 mx-1'>
        <LazyTimelineGraph data={result()}/>
      </div>
      <div className='px-4 text-xs flex gap-4'>
        <Toggle label='Table' className='toggle-xs' checked={shows.table} onChange={(e) => setShows('table', e.target.checked)} />
        <Toggle label='Bargraph' className='toggle-xs' checked={shows.bargraph} onChange={(e) => setShows('bargraph', e.target.checked)} />
      </div>
      <output className='block max-w-170 my-10 mx-auto px-10'>
        <Show when={shows.table}>
          <Table
            header={['Retry', 'Starts At (ms)', 'Delay After (ms)']}
            data={timeline().map((item) => [
              item.attempt>1 ? item.attempt-1 : <span className='text-xs'>Start</span>,
              item.timestampMs,
              item.delayAfterMs])}
          />
        </Show>
        <Show when={shows.bargraph}>
          <LazyBarGraph data={result()} />
        </Show>
      </output>

    </main>
  );
}
