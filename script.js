// Preencha a data do casamento (ex.: '12 de dezembro de 2026'). Vazio = não exibe.
const DATA_DO_CASAMENTO = '';

const $ = (s) => document.querySelector(s);

if (DATA_DO_CASAMENTO) {
  const d = $('#dataCasamento');
  d.textContent = DATA_DO_CASAMENTO;
  d.hidden = false;
}

document.querySelectorAll('[data-open]').forEach((b) =>
  b.addEventListener('click', () => document.getElementById(b.dataset.open).showModal()));

document.querySelectorAll('dialog').forEach((dlg) => {
  dlg.querySelector('[data-close]')?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
});

const form = $('#rsvpForm');
const err = $('#rsvpErr');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(form));
  const nome = f.nome.trim(), email = f.email.trim(), tel = f.tel.trim();
  const adultos = parseInt(f.adultos, 10) || 0, criancas = parseInt(f.criancas, 10) || 0;

  if (!nome || !/^\S+@\S+\.\S+$/.test(email) || tel.replace(/\D/g, '').length < 10) {
    err.textContent = 'Confira nome, e-mail e celular com DDD.';
    return;
  }
  if (adultos + criancas < 1) {
    err.textContent = 'Informe ao menos uma pessoa.';
    return;
  }
  err.textContent = '';

  const msg = [
    'Olá! Confirmo presença no casamento de Matheus & Daiara.',
    `Nome: ${nome}`, `E-mail: ${email}`, `Celular: ${tel}`,
    `Adultos: ${adultos}`, `Crianças: ${criancas}`,
  ].join('\n');
  window.location.assign(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(msg)}`);
});
