import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { Meta, Title } from "@solidjs/meta";
import { HttpHeader } from "@solidjs/start";


export default function FeedbackPage() {
  let showTimer, responseTimer;

  const [showResponse, setShowResponse] = createSignal(false);
  const [cameBack, setCameBack] = createSignal(false);
  const [showContent, setShowContent] = createSignal(false);

  const showResponseAfterCameBack = () => showResponse() && cameBack();

  const registerCameBackEvent = () => {
    // Respond when the user comes back
    ['pointerenter', 'focus']
      .forEach(event => document.addEventListener(event, (ev) => {
        console.log('user came back');
        if (showResponse()) setCameBack(true);
      }));
  }

  onMount(() => {
    showTimer = setTimeout(() => {
      setShowContent(true);
    }, 100);
  });

  onCleanup(() => {
    clearTimeout(showTimer);
    clearTimeout(responseTimer);
  });

  const formOpenClicked = (immediate) => {
    responseTimer = setTimeout(() => {
      // Show the additional block after the delay
      console.log('show response');
      setShowResponse(true);

      setTimeout(() => {
        if (immediate)
          setCameBack(true);
        else
          registerCameBackEvent();
      }, 50);


    }, immediate ? 10 : 500);
  }


  return (
    <>
      <Meta name="robots" content="noindex, nofollow" />
      <HttpHeader name="X-Robots-Tag" value="noindex, nofollow" />

      <Title>Feedback | Backoff Calculator</Title>
      <Meta name="description" content="Send feedback to the dev of 'backoff.so' Backoff Calculator" />
      <Meta name="keywords" content="backoff.so user feedback form" />

      <main className="feedback py-8 px-4">
        <Show when={showContent()}>
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
              <a role="button" className="btn btn-neutral" classList={{ 'bg-black/30': showResponse() }}
                href="https://docs.google.com/forms/d/e/1FAIpQLSeDesv6BPbbJxvpDD7zK-TTw-QtMj9AQcY9k2PZTlI6xCnkFw/viewform"
                target="_blank"
                rel="noopener nofollow external"
                onClick={() => formOpenClicked(false)}
                onAuxclick={() => formOpenClicked(true)}
              >
                Feedback Form <span className="ml-2 text-lg" aria-hidden="true">↗</span>
              </a>
            </p>
            <Show when={showResponse()}>
              <div
                class='opacity-0 transition-opacity duration-1500 ease-[steps(5,end)]'
                classList={{ 'opacity-100': showResponseAfterCameBack() }}
              >
                <p>Thank you for your time and input! ❤️</p>
                <p className="">
                  <a role="button" class="btn btn-neutral" href="/">
                    <span className="mr-2 text-lg" aria-hidden="true">←</span> Back
                  </a>
                </p>
              </div>
            </Show>
          </div>
        </Show>
      </main>
    </>
  );

}
