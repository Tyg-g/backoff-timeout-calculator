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


function RootLayout(props) {
  const url = new URL(props.location.pathname, __APP_URL__);
  const canonicalUrl = canonicalize(url.href);

  return (
    <MetaProvider>
      <Title>{__APP_TITLE__}</Title>
      <Link rel="canonical" href={canonicalUrl} />
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
