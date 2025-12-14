import { MetaProvider, Title, Link } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

import PageHeader from "./components/Header";
import PageFooter from "./components/Footer";


function canonicalize(url) {
  return url.endsWith("/") ? url : `${url}/`;
}


function LinkFavicons() {
  return (
    <>
      <Link rel="icon" type="image/svg" href="/favicons/favicon.svg"   />
      <Link rel="icon" type="image/png" href="/favicons/favicon-16.png" sizes="16x16"  />
      <Link rel="icon" type="image/png" href="/favicons/favicon-32.png" sizes="32x32"  />
      <Link rel="icon" type="image/svg" href="/favicons/favicon-dark.svg"  media="(prefers-color-scheme: dark)" />
      <Link rel="icon" type="image/png" href="/favicons/favicon-16-dark.png" sizes="16x16" media="(prefers-color-scheme: dark)" />
      <Link rel="icon" type="image/png" href="/favicons/favicon-32-dark.png" sizes="32x32" media="(prefers-color-scheme: dark)" />
      <Link rel="icon" type="image/svg" href="/favicons/favicon-light.svg"  media="(prefers-color-scheme: light)" />
      <Link rel="icon" type="image/png" href="/favicons/favicon-16-light.png" sizes="16x16" media="(prefers-color-scheme: light)" />
      <Link rel="icon" type="image/png" href="/favicons/favicon-32-light.png" sizes="32x32" media="(prefers-color-scheme: light)" />
    </>
  );
}

function RootLayout(props) {
  const url = new URL(props.location.pathname, __APP_URL__);
  const canonicalUrl = canonicalize(url.href);

  return (
    <MetaProvider>
      <Title>{__APP_TITLE__}</Title>
      <Link rel="canonical" href={canonicalUrl} />
      <LinkFavicons />
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
