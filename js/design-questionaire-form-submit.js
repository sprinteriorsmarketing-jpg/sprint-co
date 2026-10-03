(function () {
    'use strict';

    // Primary recipient: kiishann.mullani@sprint-co.com (must click the one-time
    // FormSubmit activation link the first time a submission is sent).
    // CC recipients are set on the form itself via the hidden "_cc" field.
    var PRIMARY_RECIPIENT = 'kiishann.mullani@sprint-co.com';
    var AJAX_ENDPOINT = 'https://formsubmit.co/ajax/' + PRIMARY_RECIPIENT;
    var MAX_TOTAL_FILE_BYTES = 10 * 1024 * 1024; // FormSubmit free-tier limit: 10MB per submission
    var THANK_YOU_URL = 'thank-you.html';

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function totalSize(files) {
        var total = 0;
        for (var i = 0; i < files.length; i += 1) total += files[i].size;
        return total;
    }

    function renderFileList(fileInput, listEl, errorEl) {
        listEl.innerHTML = '';
        errorEl.style.display = 'none';
        errorEl.textContent = '';

        var files = fileInput.files;
        if (!files || !files.length) return;

        for (var i = 0; i < files.length; i += 1) {
            var item = document.createElement('div');
            item.className = 'file-list-item';
            var name = document.createElement('span');
            name.textContent = files[i].name;
            var size = document.createElement('span');
            size.className = 'file-size';
            size.textContent = formatBytes(files[i].size);
            item.appendChild(name);
            item.appendChild(size);
            listEl.appendChild(item);
        }

        if (totalSize(files) > MAX_TOTAL_FILE_BYTES) {
            errorEl.textContent = 'Combined file size is ' + formatBytes(totalSize(files)) + '. Please keep total attachments under 10 MB.';
            errorEl.style.display = 'block';
        }
    }

    function setStatus(statusEl, message, kind) {
        statusEl.textContent = message;
        statusEl.className = 'form-status is-visible' + (kind ? ' is-' + kind : '');
    }

    function setLoading(button, loading) {
        if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
        button.disabled = loading;
        button.textContent = loading ? 'Submitting…' : button.dataset.originalLabel;
    }

    function init() {
        var form = document.getElementById('design-questionnaire-form');
        if (!form) return;

        var fileInput = document.getElementById('brand-files');
        var fileList = document.getElementById('brand-files-list');
        var fileError = document.getElementById('brand-files-error');
        var statusEl = document.getElementById('form-status');
        var submitBtn = document.getElementById('submit-btn');

        if (fileInput) {
            fileInput.addEventListener('change', function () {
                renderFileList(fileInput, fileList, fileError);
            });
        }

        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Honeypot: bots fill every field, humans never see this one.
            var honey = form.querySelector('[name="_honey"]');
            if (honey && honey.value) return;

            if (!form.reportValidity()) return;

            if (fileInput && fileInput.files.length && totalSize(fileInput.files) > MAX_TOTAL_FILE_BYTES) {
                renderFileList(fileInput, fileList, fileError);
                fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            setStatus(statusEl, '', '');
            statusEl.className = 'form-status';
            setLoading(submitBtn, true);

            try {
                var response = await fetch(AJAX_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(form)
                });

                if (!response.ok) throw new Error('Request failed with status ' + response.status);

                // FormSubmit returns HTTP 200 even when it rejects a submission
                // (e.g. unactivated recipient, blacklist hit) — the real result is
                // in the JSON body, so response.ok alone can't be trusted.
                var data = await response.json().catch(function () { return null; });
                if (!data || String(data.success) !== 'true') {
                    throw new Error((data && data.message) || 'FormSubmit rejected the submission.');
                }

                setStatus(statusEl, 'Thank you! Your questionnaire has been submitted. Our team will be in touch within 2 business days.', 'success');
                form.reset();
                if (fileList) fileList.innerHTML = '';
                setTimeout(function () {
                    window.location.assign(THANK_YOU_URL);
                }, 1200);
            } catch (error) {
                setStatus(statusEl, 'We could not submit your questionnaire. Please check your connection and try again, or email us directly at ' + PRIMARY_RECIPIENT + '.', 'error');
                setLoading(submitBtn, false);
                if (window.console) console.error('Design questionnaire submission failed:', error.message);
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
