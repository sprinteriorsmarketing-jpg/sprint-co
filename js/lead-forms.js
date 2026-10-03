(function () {
    'use strict';

    var config = window.SprintCoLeadConfig || {};
    var utmKeys = ['utm_source', 'utm_medium', 'utm_content', 'utm_term', 'utm_campaign'];
    var storageKey = 'sprintco_campaign_attribution';
    var captchaPromise;

    function captureAttribution() {
        var params = new URLSearchParams(window.location.search);
        var stored = {};
        try { stored = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch (ignore) {}
        utmKeys.forEach(function (key) {
            var value = params.get(key);
            if (value) stored[key] = value.slice(0, 255);
        });
        try { sessionStorage.setItem(storageKey, JSON.stringify(stored)); } catch (ignore) {}
        return stored;
    }

    var attribution = captureAttribution();

    function loadCaptcha() {
        if (captchaPromise) return captchaPromise;
        captchaPromise = new Promise(function (resolve, reject) {
            if (!config.siteKey || config.siteKey.indexOf('REPLACE_WITH_') === 0) {
                return reject(new Error('CAPTCHA is not configured.'));
            }
            if (window.grecaptcha) return window.grecaptcha.ready(resolve);
            var script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(config.siteKey);
            script.async = true;
            script.defer = true;
            script.onload = function () { window.grecaptcha.ready(resolve); };
            script.onerror = function () { reject(new Error('CAPTCHA could not be loaded.')); };
            document.head.appendChild(script);
        });
        return captchaPromise;
    }

    function value(form, selectors) {
        for (var i = 0; i < selectors.length; i += 1) {
            var field = form.querySelector(selectors[i]);
            if (field && String(field.value || '').trim()) return String(field.value).trim();
        }
        return '';
    }

    function enhanceNewsletter(form) {
        if (!form.classList.contains('bv2-newsletter-form')) return;
        form.removeAttribute('onsubmit');
        var email = form.querySelector('input[type="email"]');
        if (email) {
            email.name = 'email';
            email.required = true;
            email.setAttribute('autocomplete', 'email');
        }
        if (!form.querySelector('[name="full_name"]')) {
            var name = document.createElement('input');
            name.type = 'text'; name.name = 'full_name'; name.required = true;
            name.placeholder = 'Your full name'; name.autocomplete = 'name';
            name.className = email ? email.className : 'bv2-newsletter-input';
            form.insertBefore(name, email || form.firstChild);
        }
        if (!form.querySelector('[name="phone"]')) {
            var phone = document.createElement('input');
            phone.type = 'tel'; phone.name = 'phone'; phone.required = true;
            phone.placeholder = 'Mobile number'; phone.autocomplete = 'tel';
            phone.inputMode = 'tel'; phone.maxLength = 20;
            phone.className = email ? email.className : 'bv2-newsletter-input';
            form.insertBefore(phone, email ? email.nextSibling : form.firstChild);
        }
        form.dataset.service = form.dataset.service || 'Newsletter Subscription';
    }

    function addHoneypot(form) {
        if (form.querySelector('[name="website"]')) return;
        var field = document.createElement('input');
        field.type = 'text'; field.name = 'website'; field.tabIndex = -1;
        field.autocomplete = 'off'; field.setAttribute('aria-hidden', 'true');
        field.style.cssText = 'position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;';
        form.appendChild(field);
    }

    function getButton(form) { return form.querySelector('button[type="submit"], input[type="submit"]'); }

    function setLoading(form, loading) {
        var button = getButton(form);
        if (!button) return;
        if (!button.dataset.originalLabel) button.dataset.originalLabel = button.tagName === 'INPUT' ? button.value : button.innerHTML;
        button.disabled = loading;
        button.setAttribute('aria-busy', loading ? 'true' : 'false');
        if (button.tagName === 'INPUT') button.value = loading ? 'Submitting…' : button.dataset.originalLabel;
        else button.innerHTML = loading ? '<span class="lead-spinner" aria-hidden="true"></span> Submitting…' : button.dataset.originalLabel;
    }

    function clearErrors(form) {
        form.querySelectorAll('.lead-field-error').forEach(function (node) { node.remove(); });
        form.querySelectorAll('[aria-invalid="true"]').forEach(function (node) { node.removeAttribute('aria-invalid'); });
        var status = form.querySelector('.lead-form-status, #msgSubmit');
        if (status) {
            status.textContent = '';
            status.className = status.id === 'msgSubmit' ? 'form-message lead-form-status' : 'lead-form-status';
        }
    }

    function fieldFor(form, apiField) {
        var map = {
            Last_Name: ['[name="full_name"]', '#name'],
            Email: ['[name="email"]', '#email', 'input[type="email"]'],
            Mobile: ['[name="phone"]', '#phone'],
            City: ['[name="city"]', '[name="location"]', '#city']
        };
        var selectors = map[apiField] || [];
        for (var i = 0; i < selectors.length; i += 1) {
            var field = form.querySelector(selectors[i]);
            if (field) return field;
        }
        return null;
    }

    function showError(form, message, errors) {
        var status = form.querySelector('.lead-form-status, #msgSubmit');
        if (!status) {
            status = document.createElement('div');
            status.className = 'lead-form-status'; status.setAttribute('role', 'alert');
            form.appendChild(status);
        }
        status.className = status.id === 'msgSubmit'
            ? 'error form-message lead-form-status is-error'
            : 'lead-form-status is-error';
        status.setAttribute('role', 'alert');
        status.textContent = message || 'Please check the form and try again.';
        Object.keys(errors || {}).forEach(function (key) {
            var field = fieldFor(form, key);
            if (!field) return;
            field.setAttribute('aria-invalid', 'true');
            var error = document.createElement('span');
            error.className = 'lead-field-error';
            error.textContent = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
            field.insertAdjacentElement('afterend', error);
        });
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
    }

    function validate(form) {
        var errors = {};
        var name = value(form, ['[name="full_name"]', '#name']);
        var email = value(form, ['[name="email"]', '#email', 'input[type="email"]']);
        var mobile = value(form, ['[name="phone"]', '#phone']);
        var cityField = fieldFor(form, 'City');
        var city = value(form, ['[name="city"]', '[name="location"]', '#city']);

        if (!name) errors.Last_Name = ['Please enter your full name.'];
        if (!mobile) errors.Mobile = ['Please enter your mobile number.'];
        else if (!/^[0-9+()\-\s]{7,20}$/.test(mobile)) errors.Mobile = ['Please enter a valid mobile number.'];
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.Email = ['Please enter a valid email address.'];
        if (cityField && cityField.required && !city) errors.City = ['Please enter your city.'];

        if (Object.keys(errors).length) {
            showError(form, 'Please complete the required fields.', errors);
            return false;
        }
        return true;
    }

    function payloadFor(form, captchaToken) {
        return {
            Last_Name: value(form, ['[name="full_name"]', '#name']),
            Email: value(form, ['[name="email"]', '#email', 'input[type="email"]']),
            Mobile: value(form, ['[name="phone"]', '#phone']),
            City: value(form, ['[name="city"]', '[name="location"]', '#city']),
            Whatsapp_Opt_in: Boolean(form.querySelector('[name="whatsapp"]:checked, #whatsapp:checked')),
            service: form.dataset.service || value(form, ['[name="project_type"]']) || (form.id === 'contact-form' ? 'Website Contact' : 'Website Enquiry'),
            Preferred_Language: value(form, ['[name="preferred_language"]']) || document.documentElement.lang || 'English',
            UTM_Content: attribution.utm_content || '',
            UTM_Medium: attribution.utm_medium || '',
            UTM_Source: attribution.utm_source || '',
            UTM_Term: attribution.utm_term || '',
            Campaign_Name: attribution.utm_campaign || '',
            captcha_token: captchaToken,
            website: value(form, ['[name="website"]'])
        };
    }

    async function submit(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var form = event.currentTarget;
        clearErrors(form);
        if (!validate(form)) return;
        if (form.dataset.submitting === 'true') return;
        form.dataset.submitting = 'true'; setLoading(form, true);
        try {
            await loadCaptcha();
            var token = await window.grecaptcha.execute(config.siteKey, { action: 'lead_submit' });
            var response = await fetch(config.endpoint || 'https://sprint-co.com/api/leads', {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payloadFor(form, token))
            });
            var data = await response.json().catch(function () { return {}; });
            if (!response.ok) throw { userMessage: data.message, errors: data.errors };
            window.location.assign(config.thankYouUrl || '/thank-you.html');
        } catch (error) {
            showError(form, error.userMessage || error.message || 'We could not submit your request. Please try again.', error.errors || {});
            form.dataset.submitting = 'false'; setLoading(form, false);
        }
    }

    function init() {
        var forms = document.querySelectorAll('#contact-form, #landing-form, #callActionForm, .bv2-newsletter-form');
        forms.forEach(function (form) {
            enhanceNewsletter(form); addHoneypot(form);
            form.setAttribute('novalidate', 'novalidate');
            form.addEventListener('submit', submit, true);
        });
        if (forms.length) loadCaptcha().catch(function () {});
    }

    var style = document.createElement('style');
    style.textContent = '.lead-spinner{display:inline-block;width:1em;height:1em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-.15em;animation:lead-spin .7s linear infinite}.lead-form-status{display:block!important;margin-top:12px;font-size:14px;line-height:1.45}.lead-form-status:empty{display:none!important}.lead-form-status.is-error,.lead-field-error{color:#b42318}.lead-field-error{display:block;font-size:12px;margin-top:5px}[aria-invalid="true"]{outline:2px solid #b42318!important;outline-offset:2px}button[aria-busy="true"],input[aria-busy="true"]{cursor:wait!important;opacity:.8}.bv2-newsletter-form{flex-wrap:wrap}.bv2-newsletter-form .lead-form-status{flex-basis:100%}@keyframes lead-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
