(function () {
    'use strict';

    // Submissions go to the Sprint Co BMS API (Laravel), which emails the team.
    // reCAPTCHA v3 reuses the public site key from js/lead-config.js.
    var CONFIG = window.SprintCoLeadConfig || {};
    var ENDPOINT = 'https://bms.sprint-co.com/api/design-questionnaires';
    var CAPTCHA_ACTION = 'design_questionnaire_submit';
    var FALLBACK_EMAIL = 'info@sprint-co.com';
    var MAX_TOTAL_FILE_BYTES = 10 * 1024 * 1024; // API limit: 10MB combined (pdf/pptx/doc/docx/jpg/jpeg/png, max 10 files)
    var THANK_YOU_URL = CONFIG.thankYouUrl || 'thank-you.html';

    var captchaPromise;
    function loadCaptcha() {
        if (captchaPromise) return captchaPromise;
        captchaPromise = new Promise(function (resolve, reject) {
            if (!CONFIG.siteKey) return reject(new Error('CAPTCHA is not configured.'));
            if (window.grecaptcha) return window.grecaptcha.ready(resolve);
            var script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(CONFIG.siteKey);
            script.async = true;
            script.onload = function () { window.grecaptcha.ready(resolve); };
            script.onerror = function () { captchaPromise = null; reject(new Error('CAPTCHA could not be loaded.')); };
            document.head.appendChild(script);
        });
        return captchaPromise;
    }

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
            var honey = form.querySelector('[name="website"]');
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
                await loadCaptcha();
                var token = await window.grecaptcha.execute(CONFIG.siteKey, { action: CAPTCHA_ACTION });

                var body = new FormData(form);
                body.set('captcha_token', token);

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

                setStatus(statusEl, 'Thank you! Your questionnaire has been submitted. Our team will be in touch within 2 business days.', 'success');
                form.reset();
                if (fileList) fileList.innerHTML = '';
                setTimeout(function () {
                    window.location.assign(THANK_YOU_URL);
                }, 1200);
            } catch (error) {
                setStatus(statusEl, 'We could not submit your questionnaire. (' + error.message + '). Please try again, or email us directly at ' + FALLBACK_EMAIL + '.', 'error');
                setLoading(submitBtn, false);
                if (window.console) console.error('Design questionnaire submission failed:', error.message);
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
