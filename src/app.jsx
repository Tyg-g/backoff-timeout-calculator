import { MetaProvider, Title, Link, Meta } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, DEV } from "solid-js";

import "./app.css";

import PageHeader from "./components/Header";
import PageFooter from "./components/Footer";


function RootLayout(props) {
  const url = new URL(props.location.pathname, __APP_URL__);
  const canonicalUrl = canonicalize(url.href);

  return (
    <MetaProvider>

      <Title>{__APP_TITLE__}</Title>
      <Link rel="canonical" href={canonicalUrl} />

      <Meta name="description" content="Calculate the total backoff time; See how your exponential backoff works; -- For: fetch, axios -- In: Node.js, Bun, browsers accessing REST APIs." />
      <Meta name="keywords" content="exponential, retry, backoff, timing, timeout, calculator, online, fetch, axios, node.js, bun, browser, rest, api" />

      <LinkFavicons />
      <LinkSocial />

      <PageHeader />
      <div className='page-area'>
        <Suspense>{props.children}</Suspense>
      </div>
      <PageFooter />

    </MetaProvider>
  );
}


export default function App() {
  return (
    <Router root={RootLayout}>
      <FileRoutes />
    </Router>
  );
}



function canonicalize(url) {
  return url.endsWith("/") ? url : `${url}/`;
}


function LinkSocial() {
  const imgUrl = new URL('/icons/preview.png',  __APP_URL__);

  return (
    <>
      <Meta property="og:title" content="Backoff Timing Calculator (online)" />
      <Meta property="og:site_name" content="Backoff Timing Calculator (online)" />
      <Meta property="og:url" content={canonicalize(__APP_URL__)} />
      <Meta property="og:description" content="Calculate the total backoff time; See how your exponential backoff works;" />
      <Meta property="og:image" content={imgUrl.href} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="__Backoff_Calculator" />
    </>
  );
}


function LinkFavicons() {
  return (
    <>
      <Link rel="icon" type="image/svg+xml" href="/icons/favicon-light.svg"  media="(prefers-color-scheme: light)" />
      <Link rel="icon" type="image/svg+xml" href="/icons/favicon-dark.svg"  media="(prefers-color-scheme: dark)" />
      <Link rel="icon" type="image/png" href="/icons/appicon-512.png" sizes="512x512"  />
      <Link rel="apple-touch-icon" href="/icons/appicon-180.png" sizes="180x180" />

      {/* Fallbacks*/}

      <Link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
      <Link rel="icon" type="image/png" href="/icons/favicon-32.png" sizes="32x32"  />
    </>
  );
}
