import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { Meta, Title } from "@solidjs/meta";
import { HttpHeader } from "@solidjs/start";


export default function FeedbackPage() {
  let showTimer, responseTimer;

  const [showResponse, setShowResponse] = createSignal(false);
  const [show, setShow] = createSignal(false);

  onMount(() => {
    showTimer = setTimeout(() => {
      setShow(true);
    }, 100);
  });

  onCleanup(() => {
    clearTimeout(showTimer);
    clearTimeout(responseTimer);
  });

  const formOpenClicked = () => {
    responseTimer = setTimeout(() => {
      setShowResponse(true);
    }, 1000);
  }


  return (
    <>
      <Meta name="robots" content="noindex, nofollow" />
      <HttpHeader name="X-Robots-Tag" value="noindex, nofollow" />

      <Title>Feedback | Backoff Calculator</Title>
      <Meta name="description" content="Send feedback to the dev of 'backoff.so' Backoff Calculator" />
      <Meta name="keywords" content="backoff.so user feedback form" />

      <main className="feedback py-8 px-4">
        <Show when={show()}>
          <div className="bg-base-200 max-w-240 py-8 px-6 mx-auto">
            <h2>Feedback</h2>
            <p class='text-sm'>
              Please, help us improve the backoff.so timeout calculator app.
            </p>
            <p class='text-sm'>
              I value your feedback and will include it in my improvement plan. I'd like backoff.so to become a frictionless and useful tool.
            </p>
            <p className="fb-cta">
              Please, continue to the<br/>
              <a role="button" className="btn" classList={{ 'btn-neutral': !showResponse() }}
                href="https://docs.google.com/forms/d/e/1FAIpQLSeDesv6BPbbJxvpDD7zK-TTw-QtMj9AQcY9k2PZTlI6xCnkFw/viewform"
                target="_blank"
                rel="noopener nofollow external"
                onClick={formOpenClicked}
              >
                Feedback Form <span className="ml-2 text-lg" aria-hidden="true">↗</span>
              </a>
            </p>
            <Show when={showResponse()}>
              <p>Thank you for your time and input! ❤️</p>
              <p className="">
                <a role="button" class="btn btn-neutral" href="/">
                  <span className="mr-2 text-lg" aria-hidden="true">←</span> Back
                </a>
              </p>
            </Show>
          </div>
        </Show>
      </main>
    </>
  );

}
