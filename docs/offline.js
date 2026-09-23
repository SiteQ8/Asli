/*
  Keeps the site usable with no connection.

  Registering the worker is all that is needed on the page side. Everything else
  lives in sw.js. If service workers are unavailable, or registration fails, the
  site carries on exactly as before, because nothing here is load bearing.
*/
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {
      /* An unsupported browser, a private window, or a first visit over a bad
         connection. None of these should reach the person as an error. */
    });
  });
})();
