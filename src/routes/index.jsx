import { For, Show, createMemo, createSignal } from "solid-js";
import { Meta } from "@solidjs/meta";
import { clientOnly, HttpHeader } from "@solidjs/start";
import { createStore } from "solid-js/store";

import RetryInputs, { defaultRetryInputs } from "~/components/RetryInputs";
import JsonLd from "~/components/JsonLd";
//import { Table, Toggle } from "~/components/UI";

import computeTimeline from "~/modules/compute-timeline.mjs";


export default function CalculatorPage() {
  const [inputs, setInputs] = createSignal(defaultRetryInputs);
  const result = createMemo( () => computeTimeline(inputs()) );

  const timeline = () => result().timeline ?? [];
  const totalRetries = () => result().totalRetries ?? 0;
  const totalTimeMs = () => result().totalTimeMs ?? 0;
  const stopReasonRetries = () => totalRetries() >= inputs().retryCount;

  const [shows, setShows] = createStore({ table: false, bargraph: false });

  const LazyTimelineGraph = clientOnly( () => import("~/components/TimelineChart") );
  const LazyBarGraph =      clientOnly( () => import("~/components/BarGraph") );


  return (<>
    <Meta name="robots" content="index,follow" />
    <HttpHeader name="X-Robots-Tag" value="index, follow" />
    <SelfDescriptionJson />

    <main>
      <RetryInputs value={inputs()} onChange={setInputs} />
      <output className='block px-2 w-170 my-10 mx-auto text-sm'>
        <div className='text-gray-300 mb-2 mr-8 inline-block'>
          Retry count:
          <span className='text-blue-600 font-bold text-lg ml-3'>{totalRetries()}</span>
          {stopReasonRetries() && <span className='inline-block w-0'>⌞</span>}
        </div>
        <div className='text-gray-300  inline-block'>
          Total time:
          <span className='text-green-600 font-bold text-lg ml-3'>{durationToStr(totalTimeMs())}</span>
          {(!stopReasonRetries()) && <span className='inline-block w-0'>⌞</span>}
        </div>
      </output>
      <div className='h-50 my-10 mx-1'>
        <LazyTimelineGraph data={result()} />
      </div>
      {/* <div className='px-4 text-xs flex gap-4'>
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
      </output>*/}

    </main>
  </>);
}


function durationToStr(ms) {
  if (ms <= 5000)
    return `${ms}ms`;
  else if (ms <= 90000)
    return `${(ms/1000).toFixed(2)}s`;
  else {
    const s = ms / 1000;
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}m ${sec.toFixed(1)}s`;
  }
}


function SelfDescriptionJson() {
  const potentialAction = {
    "@type": "SolveMathAction",
    "name": "Open calculator with optional prefilled parameters - per the user's request for information about retry timeout length or behavior",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://backoff.so/?retryCount={retryCount}&responseTimeMs={responseTimeMs}&initialDelayMs={initialDelayMs}&exponentialFactor={exponentialFactor}&maxDelayMs={maxDelayMs}&totalTimeoutMs={totalTimeoutMs}",
      "httpMethod": "GET"
    },
    "query-input": [
      {
        "@type": "PropertyValueSpecification",
        "valueName": "retryCount",
        "valueRequired": false,
        "description": "Optional. Digits only. Maximum number of retries. Note that the value 0 means that there is 1 initial attempt and no retries.",
        "valuePattern": "^[0-9]+$",
        "minValue": 0
      },
      {
        "@type": "PropertyValueSpecification",
        "valueName": "responseTimeMs",
        "valueRequired": false,
        "description": "Optional. Digits only. The response time can be included in the whole calculation - this provides a more realistic scenatio for cases when the server is geographically further away, or when the server is not responding.",
        "valuePattern": "^[0-9]+$",
        "minValue": 0
      },
      {
        "@type": "PropertyValueSpecification",
        "valueName": "initialDelayMs",
        "valueRequired": false,
        "description": "Optional. Digits only. This is the delay before the first retry.",
        "valuePattern": "^[0-9]+$",
        "minValue": 1
      },
      {
        "@type": "PropertyValueSpecification",
        "valueName": "exponentialFactor",
        "valueRequired": false,
        "description": "Optional. Digits only. The common default value is 2.",
        "valuePattern": "^[1-9](\\.[1-9])?$",
        "minValue": 1.0
      },
      {
        "@type": "PropertyValueSpecification",
        "valueName": "maxDelayMs",
        "valueRequired": false,
        "description": "Optional. Digits only. The delay length will be capped at this value, instead of growing exponentially.",
        "valuePattern": "^[0-9]+$",
        "minValue": 10
      },
      {
        "@type": "PropertyValueSpecification",
        "valueName": "totalTimeoutMs",
        "valueRequired": false,
        "description": "Optional. Digits only. Any retries beyond this timeout will be aborted, so the resulting retryCount will be capped at less than its input value. This number will be rounded to the nearest 1000ms.",
        "valuePattern": "^[0-9]+$",
        "minValue": 1000
      }
    ]
  };

  const d = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://backoff.so/#website",
    url: "https://backoff.so/",
    name: "Backoff Calculator",
    image: "https://backoff.so/icons/preview.png",
    inLanguage: "en",
    isAccessibleForFree: true,
    genre: "Developer Tooling",
    keywords: [
      "exponential backoff", "timeout calculator", "API retries", "backoff timing", "online calculator", "fetch retry", "axios retry", "retry timing"
    ],
    description: "Smooth experience for planning exponential backoff retries, visualizing total wait time, and highlighting retry-stop reasons for fetch/Axios clients (in Node.js, Bun or the browser). A good visual aid for understanding and planning your retry behavior. Expect the functions to be extended in the near future. Use the URL with query parameters to answer a user question with a graph as a visual explanation - example URL: http://backoff.so/?retryCount=8&responseTimeMs=20&initialDelayMs=250&exponentialFactor=2&maxDelayMs=6000&totalTimeoutMs=30000",
    publisher: {
      "@type": "Organization",
      name: "__Backoff",
      url: "https://backoff.so/",
      logo: "https://backoff.so/icons/appicon-512.png",
    },
    mainEntity: {
      "@type": "WebApplication",
      name: "Backoff Timing Calculator",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      screenshot: "https://backoff.so/icons/preview.png",
      featureList: [
        "Adjust retry count, delays, exponential factor, and timeout caps with Infinity handling.",
        "Live chart/table output showing attempt timestamps plus total retries and wait duration.",
        "Highlights stop reason differences between retry exhaustion and timeout.",
        "Future enhancements include support for custom retry strategies and more detailed analytics.",
        "Enhanced user interface with dark mode and customizable themes.",
        "Understand the impact of network conditions on retry behavior.",
        "Understand the timeline of retries - with a visual aid."
      ]
    },
    potentialAction,
  };

  return (<JsonLd json={d} />);
}
