import { createMiddleware } from "@solidjs/start/middleware";

const min  = 60;
const hour = 60*min;
const day  = 24*hour;
const year = 365*day;

export default createMiddleware({

  async onBeforeResponse(event) {
    addHeaders(event.response.headers);
  }

});


function addHeaders(hdrs){
  if (!hdrs.get( "Cache-Control" )) {
    hdrs.set("Cache-Control",
      `public, max-age=${day}, s-maxage=${day}, stale-while-revalidate=${hour}, stale-if-error=${hour}`);
  }

  if (!hdrs.get( "Last-Modified" )) {
    hdrs.set("Last-Modified", new Date(__BUILD_TIME__).toUTCString());
  }

  hdrs.set("X-Frame-Options", "DENY");
  hdrs.set("Strict-Transport-Security", `max-age=${day}; includeSubDomains`);
  hdrs.set("Cross-Origin-Opener-Policy", "same-origin");
  //hdrs.set("Cross-Origin-Resource-Policy", "same-origin");
  hdrs.set("X-Content-Type-Options", "nosniff");
}
