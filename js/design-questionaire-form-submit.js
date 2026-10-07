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

    function cleanText(el) {
        return el.textContent.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
    }

    // Builds a plain printable copy of the answers so the browser's
    // "Save as PDF" captures full textarea content (not clipped boxes).
    function buildSummary(form) {
        var wrap = document.createElement('div');
        wrap.id = 'pdf-summary';

        var title = document.createElement('h1');
        title.textContent = 'Design & Build Questionnaire';
        wrap.appendChild(title);
        var date = document.createElement('div');
        date.className = 'pdf-date';
        date.textContent = new Date().toLocaleDateString();
        wrap.appendChild(date);

        form.querySelectorAll('.section-title, .question-group-title, .main-offering-card, .question-item').forEach(function (el) {
            if (el.classList.contains('section-title')) {
                var h2 = document.createElement('h2');
                h2.textContent = cleanText(el);
                wrap.appendChild(h2);
                return;
            }
            if (el.classList.contains('question-group-title')) {
                var h3 = document.createElement('h3');
                h3.textContent = cleanText(el);
                wrap.appendChild(h3);
                return;
            }

            var label = el.querySelector('label');
            var answers = [];
            el.querySelectorAll('input, textarea').forEach(function (f) {
                if (f.name === 'website' || f.type === 'file' || f.type === 'hidden') return;
                if (f.type === 'radio' || f.type === 'checkbox') {
                    if (f.checked) answers.push(f.value);
                } else if (f.value.trim()) {
                    var prefix = el.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').length > 1 && f.placeholder
                        ? f.placeholder + ': ' : '';
                    answers.push(prefix + f.value.trim());
                }
            });
            var fileInput = el.querySelector('input[type="file"]');
            if (fileInput && fileInput.files.length) {
                answers.push('Attachments: ' + Array.prototype.map.call(fileInput.files, function (f) { return f.name; }).join(', '));
            }

            var q = document.createElement('div');
            q.className = 'pdf-q';
            var b = document.createElement('b');
            b.textContent = label ? cleanText(label) : '';
            var s = document.createElement('span');
            s.textContent = answers.length ? answers.join('\n') : '—';
            q.appendChild(b);
            q.appendChild(s);
            wrap.appendChild(q);
        });
        return wrap;
    }

    function savePdf(form, summary) {
        var old = document.getElementById('pdf-summary');
        if (old) old.remove();
        document.body.appendChild(summary || buildSummary(form));
        document.body.classList.add('pdf-mode');
        var cleanup = function () {
            document.body.classList.remove('pdf-mode');
            var el = document.getElementById('pdf-summary');
            if (el) el.remove();
            window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);
        window.print();
    }

    function init() {
        var form = document.getElementById('design-questionnaire-form');
        if (!form) return;

        ['save-pdf-btn', 'save-pdf-top-btn'].forEach(function (id) {
            var pdfBtn = document.getElementById(id);
            if (pdfBtn) pdfBtn.addEventListener('click', function () { savePdf(form); });
        });

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

                // Capture the answers before the form is cleared so the client can keep a copy.
                var submitted = buildSummary(form);
                setStatus(statusEl, 'Thank you! Your questionnaire has been submitted. Our team will be in touch within 2 business days. ', 'success');
                form.reset();
                if (fileList) fileList.innerHTML = '';

                var goToThanks = function () { window.location.assign(THANK_YOU_URL); };
                var copyBtn = document.createElement('button');
                copyBtn.type = 'button';
                copyBtn.className = 'save-pdf-btn';
                copyBtn.textContent = 'Download your copy (PDF)';
                copyBtn.addEventListener('click', function () { savePdf(form, submitted); });
                var continueBtn = document.createElement('button');
                continueBtn.type = 'button';
                continueBtn.className = 'save-pdf-btn';
                continueBtn.textContent = 'Continue';
                continueBtn.addEventListener('click', goToThanks);
                statusEl.appendChild(document.createElement('br'));
                statusEl.appendChild(copyBtn);
                statusEl.appendChild(continueBtn);
                submitBtn.disabled = true;
                setTimeout(goToThanks, 60000);
            } catch (error) {
                setStatus(statusEl, 'We could not submit your questionnaire (' + error.message + '). Please try again, or email us directly at ' + FALLBACK_EMAIL + '.', 'error');
                setLoading(submitBtn, false);
                if (window.console) console.error('Design questionnaire submission failed:', error.message);
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
