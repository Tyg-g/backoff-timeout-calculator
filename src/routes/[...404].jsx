import { Meta } from "@solidjs/meta";
import { HttpStatusCode, HttpHeader } from "@solidjs/start";


export default function NotFound() {
  return (<>
    <HttpStatusCode code={404} />
    <Meta name="robots" content="noindex,nofollow" />
    <HttpHeader name="Cache-Control" value="public, max-age=60, s-maxage=3600" />
    <HttpHeader name="X-Robots-Tag" value="noindex, nofollow" />

    <style> {`
      main {
        padding-inline: 4rem;
      }

      h2 {
        font-size: 1.5rem;
        margin-block: 2.5rem;
      }

      p {
        color: var(--color-gray-600);
        margin-block: 1.8rem;
      }
    `}</style>

    <main>
      <h2>404 __ Page Not Found</h2>
      <p>
        You followed an invalid link, or you entered an incorrect URL.
      </p>
      <a className='btn btn-neutral' href='/'>
        _back off&nbsp;&nbsp;&nbsp;
      </a>{" "}

    </main>
  </>);
}
