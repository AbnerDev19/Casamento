document.addEventListener('DOMContentLoaded', () => {

    /* --- LOADER --- */
    const loader = document.getElementById('pageLoader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('loaded'), 400);
    });
    setTimeout(() => loader.classList.add('loaded'), 2500);


    /* --- NAVBAR SCROLL --- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });


    /* --- MENU MOBILE FULLSCREEN --- */
    const menuIcon = document.getElementById('menuIcon');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    menuIcon.addEventListener('click', openMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));


    /* --- SCROLL REVEAL --- */
    const revealEls = document.querySelectorAll('.hidden-element');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-element');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));


    /* --- COUNTDOWN (com meses) --- */
    // Data do casamento definida: 07 de setembro de 2027. Horário ainda não definido.
    const weddingDate = new Date('2027-09-07T00:00:00-03:00');

    const monthsEl = document.getElementById('months');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function setWithTick(el, value) {
        const padded = String(value).padStart(2, '0');
        if (el.textContent !== padded) {
            el.textContent = padded;
            el.classList.remove('tick');
            void el.offsetWidth;
            el.classList.add('tick');
        }
    }

    function updateCountdown() {
        const now = new Date();

        if (weddingDate - now < 0) {
            [monthsEl, daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = '00');
            return;
        }

        // Diferença calendário-aware em meses e dias
        let months = (weddingDate.getFullYear() - now.getFullYear()) * 12 + (weddingDate.getMonth() - now.getMonth());
        let anchor = new Date(now);
        anchor.setMonth(anchor.getMonth() + months);
        if (anchor > weddingDate) {
            months -= 1;
            anchor = new Date(now);
            anchor.setMonth(anchor.getMonth() + months);
        }

        const remainderMs = weddingDate - anchor;
        const days = Math.floor(remainderMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainderMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainderMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainderMs % (1000 * 60)) / 1000);

        setWithTick(monthsEl, months);
        setWithTick(daysEl, days);
        setWithTick(hoursEl, hours);
        setWithTick(minutesEl, minutes);
        setWithTick(secondsEl, seconds);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);


    /* --- GALERIA / LIGHTBOX --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-full');
            lightboxImg.src = src;
            lightboxImg.alt = item.querySelector('img').alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeMobileMenu();
        }
    });


    /* --- FORMULÁRIO RSVP --- */
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSuccess = document.getElementById('rsvpSuccess');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Aqui a confirmação pode ser conectada a um serviço de formulários
            // (Google Forms, Formspree, backend próprio, etc.) para receber os dados.
            rsvpForm.style.display = 'none';
            rsvpSuccess.classList.remove('hidden');
        });
    }

});
