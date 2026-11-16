/* ─────────────────────────────────────────
   CHECKLIST REQUEST FORM — sends the request to the BMS API
   Lives only alongside fb-branding-master-checklist.html — not shared
   with, or loaded by, the main site's js/ files.
───────────────────────────────────────── */
(function () {
  "use strict";
  var ENDPOINT = "https://bms.sprint-co.com/api/checklist-requests";
  var FALLBACK_EMAIL = "info@sprint-co.com";
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

      // The tick boxes sit outside this <form> and have no name attribute,
      // so FormData(form) never picks them up. Collect them explicitly.
      var ticked = Array.prototype.slice.call(document.querySelectorAll('[data-item]:checked'))
        .map(function (cb) {
          var groupEl = document.getElementById(cb.getAttribute('aria-labelledby'));
          var group = groupEl ? groupEl.textContent.trim() : cb.id;
          var section = cb.closest('.checklist-section');
          var sectionEl = section && section.querySelector('.section-heading h2');
          var sectionName = sectionEl ? sectionEl.textContent.replace(/\s+/g, ' ').trim() : '';
          return sectionName ? sectionName + ' — ' + group : group;
        });
      var tickedText = ticked.length ? ticked.join('\n') : 'None ticked';

      var body = new FormData(form);
      body.append('checklist_items', tickedText);
      // Also fold the ticked groups into the requirement text so they reach the
      // notification email even if the BMS API ignores unknown fields.
      body.set('requirement', (body.get('requirement') || '') +
        '\n\n--- Checklist groups ticked (' + ticked.length + ') ---\n' + tickedText);

      try {
        var response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: body
        });
        var data = await response.json().catch(function () { return null; });

        if (!response.ok) {
          var detail = data && data.errors
            ? Object.keys(data.errors).map(function (k) { return data.errors[k][0]; }).join(' ')
            : '';
          throw new Error(detail || (data && data.message) || 'Request failed with status ' + response.status);
        }

        setStatus('Thanks! We’ve got your details — check your inbox shortly.', 'success');
        form.reset();
        setTimeout(function () {
          window.location.assign(THANK_YOU_URL);
        }, 1200);
      } catch (error) {
        setStatus('We could not send your details. Please try again, or email us directly at ' + FALLBACK_EMAIL + '.', 'error');
        setLoading(false);
        if (window.console) console.error('Checklist request form submission failed:', error.message);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
