import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

import PageHeader from "./components/Header";


function RootLayout(props) {
  return (
    <MetaProvider>
      <Title>Timeout Calculator</Title>
      <PageHeader />
      <Suspense>{props.children}</Suspense>
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
