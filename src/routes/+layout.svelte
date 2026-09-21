<script>
  import '$lib/styles/stylesheet.css';
  import logo from '$lib/assets/artquake-logo.avif';
  import { base } from '$app/paths';

  let { children } = $props();

  let ctaNaam = $state('');
  let ctaEmail = $state('');
  let ctaBericht = $state('');
  let ctaVersturen = $state(false);
  let ctaVerstuurd = $state(false);
  let ctaFout = $state('');

  async function verstuurContact(e) {
    e.preventDefault();
    ctaFout = '';
    ctaVersturen = true;
    try {
      const res = await fetch('https://formsubmit.co/ajax/jamievos100@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          naam: ctaNaam,
          email: ctaEmail,
          bericht: ctaBericht,
          _subject: `Nieuw bericht via artquake.nl van ${ctaNaam}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success !== 'true') throw new Error(data.message || 'Versturen mislukt');
      ctaNaam = '';
      ctaEmail = '';
      ctaBericht = '';
      ctaVerstuurd = true;
    } catch (err) {
      ctaFout = 'Versturen mislukt. Probeer het later opnieuw of mail ons direct.';
    } finally {
      ctaVersturen = false;
    }
  }
</script>

{@render children()}

<section class="cta" id="doe-mee" aria-label="Contact">
  <span class="cta-blob" aria-hidden="true"></span>
  <hgroup class="cta-copy">
    <h2 class="cta-title">VRAAG HET<br />GEWOON.<br />SERIEUS.</h2>
    <p class="cta-text">
      Een vraag, een idee, of gewoon interesse? Stuur ons een berichtje, we
      reageren binnen twee werkdagen.
    </p>
  </hgroup>
  <form class="cta-form" onsubmit={verstuurContact}>
    <p class="cta-form-label">CONTACT</p>
    <label class="cta-field-label">
      <span class="visually-hidden">Naam</span>
      <input class="cta-field" type="text" name="naam" placeholder="naam" autocomplete="name" bind:value={ctaNaam} required />
    </label>
    <label class="cta-field-label">
      <span class="visually-hidden">E-mail</span>
      <input class="cta-field" type="email" name="email" placeholder="e-mail" autocomplete="email" bind:value={ctaEmail} required />
    </label>
    <label class="cta-field-label">
      <span class="visually-hidden">Je vraag of bericht</span>
      <textarea class="cta-field cta-textarea" name="bericht" placeholder="je vraag of bericht" rows="3" bind:value={ctaBericht} required></textarea>
    </label>

    {#if ctaFout}
      <p class="cta-feedback cta-feedback-error">{ctaFout}</p>
    {/if}
    {#if ctaVerstuurd}
      <p class="cta-feedback">Bedankt! Je bericht is verstuurd — we reageren binnen twee werkdagen.</p>
    {/if}

    <button type="submit" class="cta-submit" disabled={ctaVersturen}>
      {ctaVersturen ? 'BEZIG…' : 'VERSTUUR'}
    </button>
  </form>
</section>

<footer class="footer">
  <img class="footer-brand" src={logo} alt="Artquake — creative space" />
  <p class="footer-tag">
    Culturele organisatie voor en door jonge makers.<br />Jongerenkunst ·
    Talentontwikkeling · Community.
  </p>
  <nav class="footer-col" aria-label="Doen">
    <h3 class="footer-heading heading-orange">DOEN</h3>
    <ul>
      <li><a href="{base}/reserveren">Reserveren</a></li>
      <li>Optredens</li>
      <li>Exposities</li>
      <li>Events</li>
      <li>Workshops</li>
    </ul>
  </nav>
  <nav class="footer-col" aria-label="Groeien">
    <h3 class="footer-heading heading-lilac">GROEIEN</h3>
    <ul>
      <li>Masterclasses</li>
      <li>Lessen</li>
      <li>Coaching</li>
      <li>Promotie</li>
      <li>Netwerk</li>
    </ul>
  </nav>
  <nav class="footer-col" aria-label="Contact">
    <h3 class="footer-heading heading-cream">CONTACT</h3>
    <ul>
      <li><a href="mailto:info@art-quake.com">info@art-quake.com</a></li>
      <li><a href="https://api.whatsapp.com/send?phone=31640129447">+31 6 401 29 447</a></li>
      <li>Sara de Bronovoland 7,<br />Heerhugowaard</li>
    </ul>
  </nav>
  <nav class="footer-col" aria-label="Socials">
    <h3 class="footer-heading heading-orange">SOCIALS</h3>
    <ul>
      <li><a href="https://www.instagram.com/artquake.westfriesland/" target="_blank" rel="noopener">Instagram</a></li>
      <li><a href="https://www.youtube.com/channel/UCOcpcYV4ybeHuJND7ZhQURQ" target="_blank" rel="noopener">YouTube</a></li>
      <li><a href="https://www.tiktok.com/@artquake_westfriesland" target="_blank" rel="noopener">TikTok</a></li>
      <li><a href="https://www.facebook.com/artquake.westfriesland/" target="_blank" rel="noopener">Facebook</a></li>
    </ul>
  </nav>
  <p class="footer-bottom">
    <span>© 2026 ARTQUAKE</span>
    <span class="footer-legal">
      <a href="https://jamievos991.github.io/artquake-vue/#/privacypolicy">Privacybeleid</a>
      <a href="https://jamievos991.github.io/artquake-vue/#/termsandconditions">Algemene voorwaarden</a>
    </span>
    <span>MADE LOUD IN NL BY <a href="https://lychees.studio">LYCHEES.STUDIO</a></span>
  </p>
</footer>

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* cta */
  .cta {
    position: relative;
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 74px 40px;
    border-bottom: 4px solid var(--color-bg);
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
    gap: clamp(20px, 3vw, 50px);
    align-items: center;
  }
  .cta-blob {
    position: absolute;
    right: -60px;
    top: -60px;
    width: 320px;
    height: 320px;
    border-radius: 160px;
    background: var(--color-primary);
  }
  .cta-copy {
    position: relative;
    margin: 0;
  }
  .cta-title {
    margin: 0 0 18px;
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(48px, 7vw, 104px);
    line-height: 0.84;
    letter-spacing: -0.035em;
  }
  .cta-text {
    margin: 0;
    max-width: 560px;
    font: 400 14px/1.6 "Space Mono", monospace;
  }
  .cta-form {
    position: relative;
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 3px solid var(--color-bg);
    box-shadow: 12px 12px 0 var(--color-primary);
  }
  .cta-form-label {
    margin: 0;
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.14em;
    color: var(--color-accent);
  }
  .cta-field-label {
    display: block;
  }
  .cta-field {
    width: 100%;
    box-sizing: border-box;
    background: #242424;
    border: none;
    padding: 14px;
    font: 400 13px/1 "Space Mono", monospace;
    color: var(--color-fg);
  }
  .cta-field::placeholder {
    color: #8d8d8d;
  }
  .cta-textarea {
    font-family: "Space Mono", monospace;
    line-height: 1.5;
    resize: vertical;
  }
  .cta-submit {
    background: var(--color-primary);
    color: var(--color-fg);
    padding: 16px;
    text-align: center;
    border-radius: 26px;
    font: 800 18px/1 "Archivo", sans-serif;
    border: none;
    cursor: pointer;
  }
  .cta-submit:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }
  .cta-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .cta-feedback {
    margin: 0;
    font: 700 12px/1.5 "Space Mono", monospace;
    color: var(--color-primary-light);
  }
  .cta-feedback-error {
    color: var(--color-accent);
  }

  /* footer */
  .footer {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 56px 40px 34px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) repeat(4, minmax(0, 1fr));
    gap: clamp(35px, 3vw, 36px);
    font: 400 12px/1.9 "Space Mono", monospace;
  }
  .footer-brand {
    grid-column: 1;
    display: block;
    margin: 0 0 12px;
    height: 64px;
    width: auto;
  }
  .footer-tag {
    grid-column: 1;
    margin: 0;
    color: #9a9a9a;
  }
  .footer-col ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .footer-col a {
    color: inherit;
    text-decoration: none;
  }
  .footer-col a:hover {
    text-decoration: underline;
  }
  .footer-heading {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
  }
  .heading-orange { color: var(--color-accent); }
  .heading-lilac  { color: var(--color-primary-light); }
  .heading-cream  { color: var(--color-fg); }
  .footer-bottom {
    grid-column: 1 / -1;
    margin: 34px 0 0;
    padding-top: 16px;
    border-top: 2px solid #242424;
    display: flex;
    justify-content: space-between;
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.14em;
    color: #7d7d7d;
  }
  .footer-legal {
    display: flex;
    gap: 20px;
  }
  .footer-bottom a {
    color: inherit;
    text-decoration: underline;
  }
  .footer-bottom a:hover { opacity: 0.7; }

  @media (max-width: 860px) {
    .cta {
      grid-template-columns: 1fr;
      padding: 56px 40px;
    }
    .cta-blob {
      width: 220px;
      height: 220px;
      right: -40px;
      top: -40px;
    }
    .cta-form {
      max-width: 560px;
    }
    .footer { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .footer-brand, .footer-tag { grid-column: 1 / -1; }
  }

  @media (max-width: 640px) {
    .cta {
      padding: 48px 20px;
      gap: 32px;
    }
    .cta-blob {
      width: 140px;
      height: 140px;
      right: -24px;
      top: -24px;
      border-radius: 70px;
    }
    .cta-form {
      max-width: none;
      padding: 18px;
      box-shadow: 6px 6px 0 var(--color-primary);
    }
    .cta-submit {
      padding: 14px;
      font-size: 16px;
    }
    .footer { padding-left: 20px; padding-right: 20px; grid-template-columns: 1fr; }
    .footer-brand, .footer-tag, .footer-col { grid-column: 1; }
    .footer-brand { height: 48px; }
    .footer-bottom { flex-direction: column; gap: 6px; }
  }
</style>
