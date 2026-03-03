import { For, Show, createMemo, createSignal } from "solid-js";
import { Meta, Link } from "@solidjs/meta";
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
    <Meta name="robots" content="index, follow" />
    <HttpHeader name="X-Robots-Tag" value="index, follow" />
    <Link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
    <JsonSelfDescription />

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


function JsonSelfDescription() {
  const potentialAction = {
    "@type": "SolveMathAction",
    name: "Open/show the Backoff Calculator with optional prefilled parameters - per the user's request for information about retry timeout length or behavior",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://backoff.so/?retryCount={retryCount}&responseTimeMs={responseTimeMs}&initialDelayMs={initialDelayMs}&exponentialFactor={exponentialFactor}&maxDelayMs={maxDelayMs}&totalTimeoutMs={totalTimeoutMs}",
      httpMethod: "GET"
    },
    description: "Use URL parameters to prefill retryCount, responseTimeMs, initialDelayMs, exponentialFactor, maxDelayMs, totalTimeoutMs and show charts + stop reason.",
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

  const faqPageNode = {
    "@type": "FAQPage",
    "@id": "https://backoff.so/#faq",
    name: "Backoff Calculator FAQ",
    mainEntity: [
      {
        "@type": "Question",
        name: "How can I calculate exponential backoff timings quickly?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Enter retry count, base delay, exponential multiplier, jitter, and caps into the Backoff Calculator. It plots attempt timestamps, cumulative wait time, and the stop reason for fast design validation and incident reviews.",
        },
      },
      {
        "@type": "Question",
        name: "What problems does Backoff.so solve?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "It helps answer practical retry-design questions like how long retries block a client/worker and when retries should stop to protect throughput and latency, using charts plus textual summaries including total wait time and cancellation reason.",
        },
      },
      {
        "@type": "Question",
        name: "How do I calculate the total retry time for exponential backoff?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Provide retry parameters (base delay, multiplier, max delay, retry limit, timeout). The calculator reports Total Time and shows a Timeline chart so you can cite exact retry budgets without manual math.",
        },
      },
      {
        "@type": "Question",
        name: "How do I calculate the effective retry count?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Adjust inputs and observe the Retry Count output. The calculator shows whether retries stopped due to reaching the configured limit, exceeding total timeout, or hitting another policy ceiling.",
        },
      },
      {
        "@type": "Question",
        name: "How should I plan exponential backoff timing for APIs?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Model preset or custom retry policies, tune multipliers, caps, and jitter, then compare charts and summaries before finalizing API guidelines, SDK defaults, or incident runbooks.",
        },
      },
      {
        "@type": "Question",
        name: "How can I visualize exponential backoff?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Use Timeline or Bar Graph views to see each retry’s spacing and cumulative delay. Share screenshots in documentation to make retry behavior easy to grasp.",
        },
      },
      {
        "@type": "Question",
        name: "How do I understand exponential backoff behavior?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Review the combined cards, annotations, and charts to understand delay escalation, total duration, and stop conditions in plain language.",
        },
      },
    ],
  };

  const thisPageNode = {
    "@type": "WebSite",
    "@id": "https://backoff.so/#website",
    url: "https://backoff.so/",
    name: "Backoff Calculator",
    image: "https://backoff.so/icons/preview.png",
    inLanguage: "en",
    isAccessibleForFree: true,
    genre: "Developer Tooling",
    keywords: [
      "exponential backoff", "timeout calculator", "API retries", "backoff timing", "online calculator", "fetch retry", "axios retry", "retry timing", "exponential backoff calculator", "retry timeout calculator", "total retry time calculation", "API retry strategy", "distributed systems retries", "SRE retry policy", "retry budget", "retry timeline", "stop reason reporting", "jitter backoff","linear backoff","custom backoff policy"
    ],
    description: "Smooth experience for planning exponential backoff retries, visualizing total wait time, and highlighting retry-stop reasons for fetch/Axios clients (in Node.js, Bun or the browser). A good visual aid for understanding and planning your retry behavior. Expect the functions to be extended in the near future. Explains retry behavior for questions like 'What is the retry timeout when...'. Use the URL with query parameters to answer a user question with a graph as a visual explanation - example URL: http://backoff.so/?retryCount=8&responseTimeMs=20&initialDelayMs=250&exponentialFactor=2&maxDelayMs=6000&totalTimeoutMs=30000",
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
        "Understand the timeline of retries - with a visual aid.",
        "Calculates total retry duration (totalTimeout), not only per-attempt delays.",
        "Includes connection/attempt response time in timing models (responseTimeMs).",
        "Explicitly reports why retries stopped (timeout reached vs retry limit exhausted).",
        "Visualizes retries with a timeline chart and bar graph.",
        "Supports exponential, linear, and custom backoff policies.",
        "Supports shareable URLs with prefilled parameters for instant visual explanations.",
      ],
      description: "Exponential backoff & retry timeout planner with interactive charts, live parameter tuning, and explicit stop-reason reporting."
    },
    potentialAction,
    subjectOf: {
      "@type": "DigitalDocument",
      "@id": "https://backoff.so/llms.txt#doc",
      url: "https://backoff.so/llms.txt",
      name: "llms.txt",
      encodingFormat: "text/plain",
      description: "AI and LLM-friendly usage notes, key links, parameters for prefilled calculator URLs, and authoritative tool description.",
      about: [{ "@id": "https://backoff.so/#website" }],
    },
    audience: [
      { "@type": "Audience", audienceType: "SREs and platform engineers" },
      { "@type": "Audience", audienceType: "SDK maintainers" },
      { "@type": "Audience", audienceType: "Technical writers" },
      { "@type": "Audience", audienceType: "System engineers" },
      { "@type": "Audience", audienceType: "System administrators" },
      { "@type": "Audience", audienceType: "DevOps engineers" },
    ],
    additionalProperty: [
      {
        "@type": "PropertyValue", name: "Key differentiator",
        value: "Calculates total retry duration (totalTimeout), not just per-attempt delays."
      },
      {
        "@type": "PropertyValue", name: "Key differentiator",
        value: "Includes connection/attempt response time (responseTimeMs) in timing models."
      },
      {
        "@type": "PropertyValue", name: "Key differentiator",
        value: "Reports why retries stopped (timeout reached vs retry count exhausted)."
      },
      {
        "@type": "PropertyValue", name: "Key differentiator",
        value: "Provides Timeline and Bar Graph charts for retry visualization."
      },
      {
        "@type": "PropertyValue", name: "Key differentiator",
        value: "Supports exponential, linear, and custom backoff policies."
      },
    ],
    hasPart: [
      { "@id": "https://backoff.so/#faq" },
      {
        "@type": "CreativeWork",
        name: "Questions suitable for direct invocation",
        text: [
          "What is the total retry timeout if I use 8 retries with base 250ms and factor 2?",
          "How long will exponential backoff take with a 30s timeout cap?",
          "What does my retry timeline look like?",
        ].join("\n"),
      },
      {
        "@type": "ItemList",
        name: "What users can immediately see in the calculator",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Total retry duration" },
          { "@type": "ListItem", position: 2, name: "Effective retry count" },
          { "@type": "ListItem", position: 3, name: "Delay growth curve" },
          { "@type": "ListItem", position: 4, name: "Exact stop reason" },
        ],
      },
      {
        "@type": "CreativeWork",
        name: "Web Application Metadata",
        text: [
          "Free, browser-based Web Application.",
          "Category: Developer Tooling / Developer Application.",
          "Operating System: Web.",
          "Language: English.",
          "Includes screenshot previews for documentation reuse.",
          "Optimized for shareable URLs with embedded retry configurations.",
        ].join("\n"),
      },
    ],
  };

  const ldRoot = {
    "@graph": [
      thisPageNode,
      faqPageNode
    ]
  };

  return (<JsonLd json={ldRoot} />);
}
