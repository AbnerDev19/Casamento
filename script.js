// Preencha a data do casamento (ex.: '12 de dezembro de 2026'). Vazio = não exibe.
const DATA_DO_CASAMENTO = '';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setUpMusic() {
  const audio = document.getElementById('weddingMusic');
  const toggle = document.getElementById('musicToggle');
  if (!audio || !toggle) return;

  function setPlaying(playing) {
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música');
  }

  function handlePlayFailure() {
    if (audio.paused || audio.error) setPlaying(false);
  }

  function play() {
    try {
      if (audio.ended) audio.currentTime = 0;
      audio.play()?.catch(handlePlayFailure);
    } catch {
      handlePlayFailure();
    }
  }

  audio.addEventListener('playing', () => setPlaying(!audio.paused && !audio.ended && !audio.error));
  ['pause', 'ended', 'error'].forEach((event) => {
    audio.addEventListener(event, () => setPlaying(false));
  });
  toggle.addEventListener('click', () => {
    if (audio.paused || audio.ended) play();
    else audio.pause();
  });

  return { play, show: () => { toggle.hidden = false; } };
}

function setUpOpening(music) {
  const opening = document.getElementById('opening');
  const video = document.getElementById('openingVideo');
  const seal = document.getElementById('openInvite');
  const skip = document.getElementById('skipOpening');
  const invitation = document.getElementById('convite');
  const title = document.getElementById('titulo');
  const body = document.body;
  const sessionKey = 'matheus-daiara-video-aberto';
  let seen = false;

  try {
    seen = sessionStorage.getItem(sessionKey) === 'true';
  } catch {
    // Browsers can restrict storage in embedded contexts.
  }

  if (!opening || !video || !seal || !skip || !invitation || !title
    || window.location.hash || seen || reducedMotion.matches || video.error) {
    body.classList.add('invite-revealed');
    music?.show();
    return;
  }

  let requestedPlayback = false;
  let leaving = false;
  let loadTimer;

  function finishOpening() {
    opening.hidden = true;
    body.classList.remove('opening-active');
    invitation.inert = false;
    music?.show();

    try {
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // The invitation still opens when storage is unavailable.
    }

    title.focus({ preventScroll: true });
  }

  function clearLoadTimer() {
    window.clearTimeout(loadTimer);
    loadTimer = undefined;
  }

  function leaveOpening() {
    if (leaving) return;
    leaving = true;
    clearLoadTimer();
    if (requestedPlayback) video.pause();
    body.classList.add('invite-revealed');

    if (reducedMotion.matches) {
      finishOpening();
      return;
    }

    opening.classList.add('is-leaving');
    window.setTimeout(finishOpening, 380);
  }

  function waitForPlayback() {
    if (requestedPlayback && !leaving && loadTimer === undefined) {
      loadTimer = window.setTimeout(leaveOpening, 4200);
    }
  }

  seal.addEventListener('click', () => {
    if (requestedPlayback || leaving) return;
    if (reducedMotion.matches) {
      leaveOpening();
      return;
    }

    requestedPlayback = true;
    seal.setAttribute('aria-disabled', 'true');
    waitForPlayback();
    music?.play();
    try {
      video.play()?.catch(leaveOpening);
    } catch {
      leaveOpening();
    }
  });

  video.addEventListener('playing', () => {
    if (!requestedPlayback || leaving) return;
    clearLoadTimer();
    opening.classList.add('is-playing');
    seal.tabIndex = -1;
    if (document.activeElement === seal) skip.focus({ preventScroll: true });
  });
  video.addEventListener('waiting', waitForPlayback);
  video.addEventListener('stalled', waitForPlayback);
  video.addEventListener('ended', leaveOpening);
  video.addEventListener('error', leaveOpening);

  skip.addEventListener('click', leaveOpening);
  opening.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      leaveOpening();
    } else if (event.key === 'Tab') {
      if (opening.classList.contains('is-playing')) {
        event.preventDefault();
        skip.focus({ preventScroll: true });
        return;
      }
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

setUpOpening(setUpMusic());
setUpDialogs();
setUpRsvp();
