/* ─────────────────────────────────────────
   CHECKLIST REQUEST FORM — sends Name / Number / Brand Name via FormSubmit
   Lives only alongside fb-branding-master-checklist.html — not shared
   with, or loaded by, the main site's js/ files.
───────────────────────────────────────── */
(function () {
  "use strict";
  var PRIMARY_RECIPIENT = "kiishann.mullani@sprint-co.com";
  var AJAX_ENDPOINT = "https://formsubmit.co/ajax/" + PRIMARY_RECIPIENT;
  var THANK_YOU_URL = "../thank-you.html";

  function init() {
    var form = document.getElementById('checklist-request-form');
    if (!form) return;

    var statusEl = document.getElementById('reqFormStatus');
    var submitBtn = document.getElementById('reqSubmitBtn');

    function setStatus(message, kind) {
      statusEl.textContent = message;
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    }

    function setLoading(loading) {
      if (!submitBtn.dataset.originalLabel) submitBtn.dataset.originalLabel = submitBtn.textContent;
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? 'Sending…' : submitBtn.dataset.originalLabel;
    }

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (!form.reportValidity()) return;

      setStatus('', '');
      setLoading(true);

      try {
        var response = await fetch(AJAX_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });

        if (!response.ok) throw new Error('Request failed with status ' + response.status);

        var data = await response.json().catch(function () { return null; });
        if (!data || String(data.success) !== 'true') {
          throw new Error((data && data.message) || 'FormSubmit rejected the submission.');
        }

        setStatus('Thanks! We’ve got your details — check your inbox shortly.', 'success');
        form.reset();
        setTimeout(function () {
          window.location.assign(THANK_YOU_URL);
        }, 1200);
      } catch (error) {
        setStatus('We could not send your details. Please try again, or email us directly at ' + PRIMARY_RECIPIENT + '.', 'error');
        setLoading(false);
        if (window.console) console.error('Checklist request form submission failed:', error.message);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
