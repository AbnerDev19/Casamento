// --- CONFIGURAÇÃO DA DATA DO CASAMENTO ---
const weddingDate = new Date('2026-06-20T15:00:00').getTime();

// --- CONTAGEM REGRESSIVA ---
const countdown = setInterval(function() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    // Verifica se os elementos existem antes de tentar alterar
    if (document.getElementById("days")) {
        document.getElementById("days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    if (distance < 0) {
        clearInterval(countdown);
    }
}, 1000);

// --- NAVBAR SCROLL EFFECT ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    // Adiciona classe 'scrolled' se rolar mais de 50px
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- MENU MOBILE ---
const menuIcon = document.querySelector('.menu-icon');
const navLinks = document.querySelector('.nav-links');

menuIcon.addEventListener('click', () => {
    // Alterna visibilidade
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
        menuIcon.innerHTML = '<i class="fas fa-bars"></i>'; // Ícone hambúrguer
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '60px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#ffffff';
        navLinks.style.padding = '30px';
        navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';

        // Estilizando links no mobile para ficarem escuros
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => link.style.color = '#111');

        menuIcon.innerHTML = '<i class="fas fa-times"></i>'; // Ícone X
    }
});

// --- ANIMAÇÃO AO ROLAR (INTERSECTION OBSERVER) ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-element');
        }
    });
}, { threshold: 0.1 }); // Dispara quando 10% do elemento aparece

const hiddenElements = document.querySelectorAll('.hidden-element');
hiddenElements.forEach((el) => observer.observe(el));