<script>
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  const studios = [
    { id: 'oefen',   label: 'OEFEN\nRUIMTE',  bg: 'orange', status: 'VRIJ'   },
    { id: 'opname',  label: 'OPNAME\nSTUDIO',  bg: 'dark',   status: 'VRIJ'   },
    { id: 'dans',    label: 'DANS\nSTUDIO',    bg: 'dark',   status: 'VRIJ'   },
    { id: 'atelier', label: 'ATELIER',         bg: 'purple', status: '1 PLEK' },
  ];

  let step          = $state(1); // 1=studio, 2=gegevens, 3=datum
  let selectedStudio = $state(null);
  let naam          = $state('');
  let email         = $state('');
  let datum         = $state('');
  let starttijd     = $state('');
  let eindtijd      = $state('');
  let done          = $state(false);
  let dir           = $state(1); // 1 = forward, -1 = backward
  let submitting    = $state(false);
  let error         = $state('');

  function pickStudio(id) {
    selectedStudio = id;
    dir = 1;
    step = 2;
  }

  function next() { dir = 1; step++; }
  function back() { dir = -1; step--; }

  async function submit(e) {
    e.preventDefault();
    error = '';
    submitting = true;
    try {
      await addDoc(collection(db, 'reserveringen'), {
        studio: selectedStudio,
        naam,
        email,
        datum,
        starttijd,
        eindtijd,
        aangemaaktOp: serverTimestamp(),
      });
      done = true;
    } catch (err) {
      error = 'Reserveren mislukt. Probeer het opnieuw.';
    } finally {
      submitting = false;
    }
  }

  const progress = $derived(step === 1 ? 33 : step === 2 ? 66 : 100);
  const studioObj = $derived(studios.find(s => s.id === selectedStudio));
</script>

<svelte:head><title>Reserveren — Artquake</title></svelte:head>

<div class="shell">
  <!-- Progress bar -->
  <div class="progress-track">
    <div class="progress-fill" style="width:{progress}%"></div>
  </div>

  {#if done}
    <!-- ── Bevestiging ── -->
    <div class="confirm">
      <p class="confirm-tag">GELUKT ✓</p>
      <h1 class="confirm-title">RESERVERING<br />ONTVANGEN.</h1>
      <p class="confirm-text">We sturen je een bevestiging op <strong>{email}</strong>. Tot dan!</p>
    </div>

  {:else if step === 1}
    <!-- ── Stap 1: Studio kiezen ── -->
    <div class="layout">
      <div class="left">
        <p class="eyebrow">STAP 1 / 3</p>
        <h1 class="headline"><em>KIES</em><br />JOUW<br /><mark>STUDIO</mark></h1>
        <p class="sub">Welke ruimte past bij jou? Klik op een studio om verder te gaan.</p>
      </div>
      <ul class="studios">
        {#each studios as s}
          <li
            class="studio bg-{s.bg}"
            onclick={() => pickStudio(s.id)}
            onkeydown={e => e.key === 'Enter' && pickStudio(s.id)}
            role="button"
            tabindex="0"
          >
            <span class="studio-status">☆ {s.status}</span>
            <h2 class="studio-name">
              {#each s.label.split('\n') as line, i}{#if i > 0}<br />{/if}{line}{/each}
            </h2>
            <span class="studio-arrow">→</span>
          </li>
        {/each}
      </ul>
    </div>

  {:else if step === 2}
    <!-- ── Stap 2: Gegevens ── -->
    <div class="step-screen">
      <div class="step-inner">
        <p class="eyebrow">STAP 2 / 3 · {studioObj?.label.replace('\n',' ')}</p>
        <h1 class="step-title">WIE<br /><em>BEN JE?</em></h1>
        <form class="step-form" onsubmit={e => { e.preventDefault(); next(); }}>
          <label class="lbl">
            <span>NAAM <b>*</b></span>
            <input class="inp" type="text" placeholder="voor- en achternaam" bind:value={naam} autocomplete="name" required />
          </label>
          <label class="lbl">
            <span>E-MAIL <b>*</b></span>
            <input class="inp" type="email" placeholder="jij@voorbeeld.nl" bind:value={email} autocomplete="email" required />
          </label>
          <div class="step-nav">
            <button type="button" class="btn-back" onclick={back}>← TERUG</button>
            <button type="submit" class="btn-next">VOLGENDE →</button>
          </div>
        </form>
      </div>
    </div>

  {:else if step === 3}
    <!-- ── Stap 3: Datum & Tijd ── -->
    <div class="step-screen">
      <div class="step-inner">
        <p class="eyebrow">STAP 3 / 3 · {studioObj?.label.replace('\n',' ')}</p>
        <h1 class="step-title">WANNEER<br /><em>KOM JE?</em></h1>
        <form class="step-form" onsubmit={submit}>
          <label class="lbl">
            <span>DATUM <b>*</b></span>
            <input class="inp" type="date" bind:value={datum} required />
          </label>
          <div class="time-row">
            <label class="lbl">
              <span>STARTTIJD <b>*</b></span>
              <input class="inp" type="time" bind:value={starttijd} required />
            </label>
            <label class="lbl">
              <span>EINDTIJD <b>*</b></span>
              <input class="inp" type="time" bind:value={eindtijd} required />
            </label>
          </div>
          {#if error}
            <p class="field-error">{error}</p>
          {/if}
          <div class="step-nav">
            <button type="button" class="btn-back" onclick={back}>← TERUG</button>
            <button type="submit" class="btn-next" disabled={submitting}>
              {submitting ? 'BEZIG…' : 'RESERVEER NU →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .shell {
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-fg);
    display: flex;
    flex-direction: column;
  }

  /* Progress */
  .progress-track {
    height: 5px;
    background: #1e1e1e;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
    transition: width 0.4s ease;
  }

  /* ── Step 1: two-column ── */
  .layout {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .left {
    padding: 80px 48px 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-right: 2px solid #1e1e1e;
  }

  .eyebrow {
    margin: 0 0 20px;
    font: 700 10px/1 'Space Mono', monospace;
    letter-spacing: 0.2em;
    color: var(--color-accent);
  }

  .headline {
    margin: 0 0 24px;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(52px, 7vw, 104px);
    line-height: 0.88;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    font-style: normal;
  }
  .headline em { color: var(--color-accent); font-style: normal; }
  .headline mark { background: var(--color-accent); color: var(--color-bg); padding: 0 8px; }

  .sub {
    margin: 0;
    font: 400 13px/1.65 'Space Mono', monospace;
    color: var(--color-muted);
    max-width: 360px;
  }

  /* Studio cards */
  .studios {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 3px;
    background: #111;
    border-left: 3px solid #111;
  }

  .studio {
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    min-height: 200px;
    outline: none;
    transition: filter 0.12s, transform 0.12s;
    position: relative;
  }
  .studio:hover { filter: brightness(1.1); }
  .studio:focus-visible { box-shadow: inset 0 0 0 3px var(--color-fg); }

  .bg-orange { background: var(--color-accent); color: var(--color-bg); }
  .bg-dark   { background: #181818; color: var(--color-fg); }
  .bg-purple { background: var(--color-primary); color: var(--color-fg); }

  .studio-status {
    font: 700 9px/1 'Space Mono', monospace;
    letter-spacing: 0.18em;
    opacity: 0.7;
  }

  .studio-name {
    margin: 0;
    font: 900 clamp(26px, 3.2vw, 44px)/0.9 var(--font-display), sans-serif;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    flex: 1;
    display: flex;
    align-items: flex-end;
  }

  .studio-arrow {
    position: absolute;
    bottom: 24px;
    right: 24px;
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.12s, transform 0.12s;
  }
  .studio:hover .studio-arrow { opacity: 1; transform: translateX(4px); }

  /* ── Steps 2 & 3 ── */
  .step-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }

  .step-inner {
    width: 100%;
    max-width: 520px;
  }

  .step-title {
    margin: 0 0 40px;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(52px, 8vw, 96px);
    line-height: 0.88;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    font-style: normal;
  }
  .step-title em { color: var(--color-accent); font-style: normal; }

  .step-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .lbl {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font: 700 12px/1 var(--font-display), sans-serif;
    letter-spacing: 0.1em;
  }
  .lbl b { color: var(--color-accent); font-weight: 700; }

  .inp {
    background: #1a1a1a;
    border: 1.5px solid #2a2a2a;
    border-radius: 4px;
    color: var(--color-fg);
    font: 400 16px/1 var(--font-display), sans-serif;
    padding: 16px 18px;
    outline: none;
    transition: border-color 0.12s;
    width: 100%;
    box-sizing: border-box;
  }
  .inp::placeholder { color: #3a3a3a; }
  .inp:focus { border-color: var(--color-primary); }

  .time-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .step-nav {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }

  .field-error {
    margin: -6px 0 0;
    font: 700 12px/1.5 'Space Mono', monospace;
    color: var(--color-accent);
  }

  .btn-next {
    background: var(--color-primary);
    color: var(--color-fg);
    border: none;
    border-radius: 4px;
    font: 800 16px/1 var(--font-display), sans-serif;
    letter-spacing: 0.08em;
    padding: 18px 32px;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.15s;
    flex: 1;
  }
  .btn-next:hover { background: var(--color-primary-dark); }

  .btn-back {
    background: none;
    border: none;
    color: var(--color-muted);
    font: 700 12px/1 'Space Mono', monospace;
    letter-spacing: 0.1em;
    cursor: pointer;
    padding: 8px 0;
    transition: color 0.12s;
  }
  .btn-back:hover { color: var(--color-fg); }

  /* ── Bevestiging ── */
  .confirm {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px;
    gap: 20px;
  }
  .confirm-tag {
    margin: 0;
    font: 700 11px/1 'Space Mono', monospace;
    letter-spacing: 0.2em;
    color: var(--color-accent);
  }
  .confirm-title {
    margin: 0;
    font: 900 clamp(52px, 9vw, 120px)/0.88 var(--font-display), sans-serif;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }
  .confirm-text {
    margin: 0;
    font: 400 14px/1.65 'Space Mono', monospace;
    color: var(--color-muted);
    max-width: 420px;
  }
  .confirm-text strong { color: var(--color-fg); }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    .layout { grid-template-columns: 1fr; }
    .left { border-right: none; border-bottom: 2px solid #1e1e1e; padding: 48px 28px; justify-content: flex-start; }
    .studios { border-left: none; min-height: 480px; }
  }

  @media (max-width: 480px) {
    .studios { grid-template-columns: 1fr; }
    .left { padding: 36px 20px; }
    .step-screen { padding: 40px 20px; }
    .time-row { grid-template-columns: 1fr; }
  }
</style>
