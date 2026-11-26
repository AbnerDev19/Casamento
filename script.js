// Preencha a data do casamento (ex.: '12 de dezembro de 2026'). Vazio = não exibe.
const DATA_DO_CASAMENTO = '';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setUpOpening() {
  const opening = document.getElementById('opening');
  const seal = document.getElementById('openInvite');
  const skip = document.getElementById('skipOpening');
  const invitation = document.getElementById('convite');
  const title = document.getElementById('titulo');
  const body = document.body;
  const sessionKey = 'matheus-daiara-convite-aberto';
  let seen = false;

  try {
    seen = sessionStorage.getItem(sessionKey) === 'true';
  } catch {
    // Browsers can restrict storage in embedded contexts.
  }

  if (!opening || !seal || !skip || !invitation || !title || window.location.hash || seen || reducedMotion.matches) {
    body.classList.add('intro-ready');
    return;
  }

  let revealTimer;
  let closeTimer;

  function revealInvitation() {
    body.classList.add('intro-ready');
  }

  function finishOpening() {
    window.clearTimeout(revealTimer);
    window.clearTimeout(closeTimer);
    revealInvitation();
    opening.hidden = true;
    body.classList.remove('opening-active');
    invitation.inert = false;

    try {
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // The invitation still opens when storage is unavailable.
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
    revealTimer = window.setTimeout(revealInvitation, 850);
    closeTimer = window.setTimeout(finishOpening, 1450);
  });
  skip.addEventListener('click', finishOpening);
  opening.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      finishOpening();
    } else if (event.key === 'Tab') {
      const boundary = event.shiftKey ? seal : skip;
      if (document.activeElement !== boundary) return;
      event.preventDefault();
      (event.shiftKey ? skip : seal).focus({ preventScroll: true });
    }
  });

  body.classList.add('opening-active');
  invitation.inert = true;
  opening.hidden = false;
  seal.focus({ preventScroll: true });
}

function setUpScrollReveal() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const elements = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) reveal(entry.target);
    });
  });

  function reveal(element) {
    element.classList.add('is-visible');
    observer.unobserve(element);
  }

  function revealUpTo(element) {
    for (let ancestor = element?.closest('[data-reveal]'); ancestor; ancestor = ancestor.parentElement?.closest('[data-reveal]')) {
      reveal(ancestor);
    }
  }

  function revealAnchor() {
    const id = window.location.hash.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    revealUpTo(target);
    target.querySelectorAll('[data-reveal]').forEach(reveal);
  }

  elements.forEach((element) => {
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
  document.addEventListener('focusin', (event) => revealUpTo(event.target));
}

function setUpDialogs() {
  document.querySelectorAll('[data-open]').forEach((button) => {
    const dialog = document.getElementById(button.dataset.open);
    if (typeof dialog?.showModal !== 'function') return;
    button.addEventListener('click', () => {
      if (!dialog.open) dialog.showModal();
    });
  });

  document.querySelectorAll('dialog').forEach((dialog) => {
    function isBackdrop(event) {
      if (event.target !== dialog) return false;
      const bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom;
    }

    let pressedBackdrop = false;
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('pointerdown', (event) => {
      pressedBackdrop = isBackdrop(event);
    });
    dialog.addEventListener('click', (event) => {
      if (pressedBackdrop && isBackdrop(event)) dialog.close();
      pressedBackdrop = false;
    });
  });
}

function setUpRsvp() {
  const form = document.getElementById('rsvpForm');
  const error = document.getElementById('rsvpErr');
  const submit = form?.querySelector('[type="submit"]');
  if (!form || !error || !submit) return;

  form.addEventListener('input', () => {
    error.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nome = data.get('nome')?.trim() || '';
    const email = data.get('email')?.trim() || '';
    const tel = data.get('tel')?.trim() || '';
    const adultos = Number(data.get('adultos'));
    const criancas = Number(data.get('criancas'));
    const telDigits = tel.replace(/\D/g, '');

    if (!nome || !/^\S+@\S+\.\S+$/.test(email) || !/^\+?[\d\s().-]+$/.test(tel)
      || telDigits.length < 10 || telDigits.length > 15) {
      error.textContent = 'Confira nome, e-mail e celular com DDD.';
      return;
    }
    if (!form.reportValidity()) return;
    if (adultos + criancas < 1) {
      error.textContent = 'Informe ao menos uma pessoa.';
      return;
    }

    const recipient = (form.dataset.wa || '').trim();
    if (!/^[1-9]\d{9,14}$/.test(recipient)) {
      error.textContent = 'A confirmação pelo WhatsApp ainda está indisponível.';
      return;
    }

    error.textContent = '';
    const message = [
      'Olá! Confirmo presença no casamento de Matheus & Daiara.',
      `Nome: ${nome}`, `E-mail: ${email}`, `Celular: ${tel}`,
      `Adultos: ${adultos}`, `Crianças: ${criancas}`,
    ].join('\n');
    window.location.assign(`https://wa.me/${recipient}?text=${encodeURIComponent(message)}`);
  });

  submit.disabled = false;
}

const date = document.getElementById('dataCasamento');
if (date && DATA_DO_CASAMENTO) {
  date.textContent = DATA_DO_CASAMENTO;
  date.hidden = false;
}

setUpOpening();
setUpScrollReveal();
setUpDialogs();
setUpRsvp();
