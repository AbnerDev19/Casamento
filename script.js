document.addEventListener('DOMContentLoaded', () => {

    /* --- LOADER --- */
    const loader = document.getElementById('pageLoader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('loaded'), 400);
    });
    // fallback caso 'load' demore (ex: imagens grandes)
    setTimeout(() => loader.classList.add('loaded'), 2500);


    /* --- NAVBAR SCROLL --- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });


    /* --- MENU MOBILE --- */
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    menuIcon.addEventListener('click', () => {
        const isOpen = navLinks.style.display === 'flex';
        navLinks.style.display = isOpen ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(255,255,255,0.98)';
        navLinks.style.padding = '20px 0';
        navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        navLinks.querySelectorAll('a').forEach(a => a.style.color = '#333');
        navLinks.querySelectorAll('li').forEach(li => li.style.margin = '12px 0');
        menuIcon.querySelector('i').className = isOpen ? 'fas fa-bars' : 'fas fa-times';
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        navLinks.style.display = 'none';
        menuIcon.querySelector('i').className = 'fas fa-bars';
    }));


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


    /* --- PÉTALAS FLUTUANTES NO HERO --- */
    const petalContainer = document.querySelector('.hero-petals');
    if (petalContainer) {
        const petalCount = window.innerWidth < 768 ? 12 : 22;
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('span');
            const size = 5 + Math.random() * 6;
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            petal.style.left = `${Math.random() * 100}%`;
            petal.style.animationDuration = `${8 + Math.random() * 10}s`;
            petal.style.animationDelay = `${Math.random() * 10}s`;
            petal.style.opacity = 0.3 + Math.random() * 0.5;
            petalContainer.appendChild(petal);
        }
    }


    /* --- COUNTDOWN --- */
    // Data do casamento definida: 07 de setembro de 2027. Horário ainda não definido.
    const weddingDate = new Date('2027-09-07T00:00:00-03:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function setWithTick(el, value) {
        const padded = String(value).padStart(2, '0');
        if (el.textContent !== padded) {
            el.textContent = padded;
            el.classList.remove('tick');
            void el.offsetWidth; // reinicia a animação
            el.classList.add('tick');
        }
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = '00');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

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
        if (e.key === 'Escape') closeLightbox();
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
