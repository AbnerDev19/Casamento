function setUpOpening(reducedMotion) {
    const opening = document.getElementById('opening');
    const seal = document.getElementById('openInvite');
    const skip = document.getElementById('skipOpening');
    const title = document.getElementById('heroTitle');
    const background = ['siteHeader', 'siteMain', 'siteFooter']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
    const sessionKey = 'matheus-daiara-convite-aberto';

    if (!opening || !seal || !skip || !title || window.location.hash) return;

    try {
        if (sessionStorage.getItem(sessionKey) === 'true') return;
    } catch {
        // The invitation also works when the browser blocks session storage.
    }

    let closeTimer;

    function finishOpening() {
        window.clearTimeout(closeTimer);
        opening.hidden = true;
        document.body.classList.remove('opening-active');
        background.forEach((element) => { element.inert = false; });

        try {
            sessionStorage.setItem(sessionKey, 'true');
        } catch {
            // This visit still continues to the invitation.
        }

        title.focus({ preventScroll: true });
    }

    seal.addEventListener('click', () => {
        if (opening.classList.contains('is-opening')) return;

        if (reducedMotion.matches) {
            finishOpening();
            return;
        }

        opening.classList.add('is-opening');
        seal.setAttribute('aria-disabled', 'true');
        closeTimer = window.setTimeout(finishOpening, 1550);
    });
    skip.addEventListener('click', finishOpening);
    opening.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') finishOpening();
    });

    document.body.classList.add('opening-active');
    background.forEach((element) => { element.inert = true; });
    opening.hidden = false;
    seal.focus({ preventScroll: true });
}

function setUpScrollReveal(reducedMotion) {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const revealElements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target);
        });
    });

    function reveal(element) {
        element.classList.add('is-visible');
        observer.unobserve(element);
    }

    function revealAnchor() {
        const id = window.location.hash.slice(1);
        const target = id && document.getElementById(id);
        if (!target) return;
        const container = target.closest('[data-reveal]');
        if (container) reveal(container);
        target.querySelectorAll('[data-reveal]').forEach(reveal);
    }

    revealElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
            reveal(element);
        } else {
            observer.observe(element);
        }
    });

    revealAnchor();
    document.body.classList.add('has-scroll-reveal');
    window.addEventListener('hashchange', revealAnchor);
    document.addEventListener('focusin', (event) => {
        const element = event.target.closest('[data-reveal]');
        if (element) reveal(element);
    });
}

function setUpDialogs() {
    const manual = document.getElementById('manualDialog');
    const gallery = document.getElementById('galleryDialog');
    const galleryPhoto = document.getElementById('lightboxPhoto');

    [manual, gallery].filter(Boolean).forEach((dialog) => {
        dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
            button.addEventListener('click', () => dialog.close());
        });
        dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) return;
            const bounds = dialog.getBoundingClientRect();
            const outside = event.clientX < bounds.left || event.clientX > bounds.right
                || event.clientY < bounds.top || event.clientY > bounds.bottom;
            if (outside) dialog.close();
        });
    });

    if (typeof manual?.showModal === 'function') {
        document.querySelectorAll('[data-open-manual]').forEach((button) => {
            button.addEventListener('click', () => {
                if (!manual.open) manual.showModal();
            });
        });
    }

    if (typeof gallery?.showModal === 'function' && galleryPhoto) {
        document.querySelectorAll('[data-photo]').forEach((button) => {
            const photo = button.querySelector('img');
            if (!photo) return;
            button.addEventListener('click', () => {
                if (gallery.open) return;
                galleryPhoto.src = photo.currentSrc || photo.src;
                galleryPhoto.alt = photo.alt;
                gallery.showModal();
            });
        });
    }
}

function setUpMobileNav() {
    const menu = document.getElementById('mobileNav');
    if (!menu) return;

    menu.addEventListener('click', (event) => {
        if (event.target.closest('a[href^="#"]')) menu.open = false;
    });
    menu.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !menu.open) return;
        menu.open = false;
        menu.querySelector('summary').focus();
    });
}

function setUpRsvp() {
    const form = document.getElementById('rsvpForm');
    const status = document.getElementById('rsvpStatus');
    const submit = document.getElementById('rsvpSubmit');
    if (!form || !status || !submit) return;

    const { fullName, email, phone, adults, children } = form.elements;
    const fields = [fullName, email, phone, adults, children];
    if (!fields.every(Boolean)) return;

    function setStatus(message, state) {
        status.textContent = message;
        status.dataset.state = state;
    }

    form.addEventListener('input', () => {
        fields.forEach((field) => field.setCustomValidity(''));
        setStatus('', '');
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const guestName = fullName.value.trim();
        const mobile = phone.value.trim();
        const mobileDigits = mobile.replace(/\D/g, '');
        const adultCount = adults.valueAsNumber;
        const childCount = children.valueAsNumber;

        fullName.setCustomValidity(guestName ? '' : 'Informe seu nome completo.');
        const validPhone = /^\+?[\d\s().-]+$/.test(mobile) && mobileDigits.length >= 10 && mobileDigits.length <= 15;
        phone.setCustomValidity(validPhone ? '' : 'Informe um celular com DDD.');
        adults.setCustomValidity(adultCount === 0 && childCount === 0 ? 'Informe pelo menos um convidado.' : '');

        if (!form.reportValidity()) return;

        const recipient = (form.dataset.rsvpWhatsapp || '').trim();
        if (!/^[1-9]\d{9,14}$/.test(recipient)) {
            setStatus('O recebimento das confirmações ainda será liberado. Sua resposta ainda não foi enviada.', 'pending');
            return;
        }

        const message = [
            'Confirmação de presença · Matheus & Daiara',
            `Nome: ${guestName}`,
            `E-mail: ${email.value.trim()}`,
            `Celular: ${mobile}`,
            `Adultos: ${adultCount}`,
            `Crianças: ${childCount}`
        ].join('\n');
        setStatus('Toque em Enviar no WhatsApp para concluir sua confirmação.', 'pending');
        window.location.assign(`https://wa.me/${recipient}?text=${encodeURIComponent(message)}`);
    });

    submit.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setUpOpening(reducedMotion);
    setUpScrollReveal(reducedMotion);
    setUpDialogs();
    setUpMobileNav();
    setUpRsvp();
});
