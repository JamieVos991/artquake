<script>
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import logo from "$lib/assets/artquake-logo.avif";

  const status = $derived(String(page.status || 404));
  const nietGevonden = $derived(page.status === 404);

  // losse stickers rond de rand: positie in %, draaiing in graden
  const stickers = [
    { x: 6, y: 34, r: 42, kleur: "paars", maat: 1 },
    { x: 40, y: 9, r: -14, kleur: "lijn", maat: 0.85 },
    { x: 70, y: 4, r: -38, kleur: "creme", maat: 1 },
    { x: 98, y: 26, r: 6, kleur: "lila", maat: 1.1 },
    { x: 95, y: 75, r: -6, kleur: "paars", maat: 1.15 },
    { x: 5, y: 82, r: 8, kleur: "lila", maat: 1.1 },
    { x: 34, y: 92, r: -5, kleur: "paars", maat: 1.1 },
    { x: 90, y: 97, r: -4, kleur: "creme", maat: 1.15 },
    { x: 64, y: 101, r: 10, kleur: "lijn", maat: 0.9 },
  ];
</script>

<svelte:head>
  <title>{status} — Artquake</title>
</svelte:head>

<main class="fout">
  <a class="fout-brand" href={base || "/"}>
    <img src={logo} alt="Artquake — naar home" />
  </a>

  <div class="fout-stickers" aria-hidden="true">
    {#each stickers as s, i}
      <span
        class="sticker sticker-{s.kleur}"
        style:left="{s.x}%"
        style:top="{s.y}%"
        style:--r="{s.r}deg"
        style:--maat={s.maat}
        style:--i={i}>{status}</span
      >
    {/each}
  </div>

  <div class="fout-midden">
    <p class="fout-label">FOUT {status}</p>
    <h1 class="fout-titel">OH NEE!</h1>
    <p class="fout-tekst">
      {#if nietGevonden}
        De pagina die je zoekt<br />lijkt niet te bestaan.
      {:else}
        Er ging iets mis aan onze kant.<br />Probeer het zo nog een keer.
      {/if}
    </p>
  </div>
</main>

<style>
  .fout {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 100vh;
    min-height: 100svh;
    overflow: hidden;
    background: var(--color-bg);
    color: var(--color-fg);
    border-bottom: 4px solid var(--color-fg);
  }
  .fout-brand {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    padding: 16px 30px;
  }
  .fout-brand img {
    display: block;
    height: 80px;
    width: auto;
  }

  /* stickers */
  .fout-stickers {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .sticker {
    position: absolute;
    padding: 0.12em 0.28em 0.08em;
    font-weight: 800;
    font-size: calc(clamp(38px, 6.2vw, 92px) * var(--maat));
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--color-fg);
    transform: translate(-50%, -50%) rotate(var(--r));
    animation: sticker-in 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
    animation-delay: calc(var(--i) * 0.06s);
  }
  .sticker-paars {
    background: var(--color-primary);
  }
  .sticker-lila {
    background: var(--color-primary-light);
    color: var(--color-bg);
  }
  .sticker-creme {
    background: var(--color-fg);
    color: var(--color-bg);
  }
  .sticker-lijn {
    border: 1px solid var(--color-fg);
  }
  @keyframes sticker-in {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(calc(var(--r) - 25deg)) scale(0.5);
    }
  }

  /* midden */
  .fout-midden {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120px 20px;
    text-align: center;
  }
  .fout-label {
    margin: 0 0 18px;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
  }
  .fout-titel {
    margin: 0 0 20px;
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(64px, 13vw, 190px);
    line-height: 0.9;
    letter-spacing: -0.04em;
  }
  .fout-tekst {
    margin: 0;
    font-weight: 400;
    font-size: clamp(18px, 2.4vw, 34px);
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  @media (prefers-reduced-motion: reduce) {
    .sticker {
      animation: none;
    }
  }

  @media (max-width: 640px) {
    .fout-brand {
      padding: 14px 16px;
    }
    .fout-brand img {
      height: 64px;
    }
  }
</style>
