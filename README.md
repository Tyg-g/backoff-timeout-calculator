# Backoff Timing Calculator


The source for [backoff.so](https://backoff.so/).

An interactive calculator for visualizing exponential backoff and estimating total retry duration, including response times, delay caps, and timeout limits.

Emphasizes total elapsed duration, including response time, rather than calculating only the next retry delay.

Calculate the:
- **Total retry count** from the total timeout, or
- **Total timeout time** from the retry count.

Calculate scenarios with different response times _(for the same backoff config)_, eg.:
- Optical internet connection (fast connection)
- 3G/4G (variable connection)
- Worst-case scenario, eg. the TCP connection hangs and times out – _This can be much worse than you think._


## Features

- Interactive retry timeline.
- Shareable URLs with prefilled calculator parameters.
- Total timeout budget/limit and the resulting effective retry count.
- Configurable retry count, response time, initial delay, exponential multiplier, and maximum delay.


## Example Configuration

[_Open a prefilled example_](https://backoff.so/?retryCount=8&responseTimeMs=20&initialDelayMs=250&exponentialFactor=2&maxDelayMs=6000&totalTimeoutMs=30000) with:

| Parameter | Value |
| --- | --- |
| Retry count | 8 |
| Response time | 20 ms |
| Initial delay | 250 ms |
| Exponential factor | 2 |
| Maximum delay | 6,000 ms |
| Total timeout | 30 seconds |

Eight retries (= max. nine attempts), incl. the initial request. Response time considered for each attempt. Delays grow exponentially until reaching the configured maximum, and the total timeout can stop retries early. — _The usual retry config behavior across tools and packages._

URL time parameters (`responseTimeMs`, `initialDelayMs`, `maxDelayMs`, and `totalTimeoutMs`) use **milliseconds**. The total-timeout control in the UI uses **seconds**.

The shareable link (with the URL params) is good for sharing a scenario or behavior explanation with a peer.


## Safety Limits

Limits of *1,000* attempts and *4 hours* are always enforced – even when an input is set to infinity – to limit the max. workload the browser has to perform upon opening a scenario link.



## Local Development

Reqirements: Node 22 + npm

```bash
npm i
npm run dev
```

Production build:

```bash
npm run build
```


## Feedback

Have a suggestion or found a problem? Visit [feedback page](https://backoff.so/feedback) or [bug reports](https://github.com/Tyg-g/backoff-timeout-calculator/issues).


## License

Licensed under [GNU GPL version 3](https://www.gnu.org/licenses/gpl-3.0.html).


## TODO Backlog

- Implement jitter calculation
- Transition to TypeScript (for more roboust code)
- Transition to fully static rendering
- Remove Node dependency
- Improve readability in light mode
- Add theme switch
- Better modularization of components
- Presets for common scenarios
- Personal presets (stored locally)
