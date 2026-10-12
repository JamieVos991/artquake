<script>
  import { base } from "$app/paths";
  import logo from "$lib/assets/artquake-logo.avif";

  let { data } = $props();
  const dienst = data.dienst;

  const videos = import.meta.glob("../../../lib/assets/videos/*-aftermovie.mp4", {
    eager: true,
    import: "default",
  });
  const video = dienst.video
    ? videos[`../../../lib/assets/videos/${dienst.slug}-aftermovie.mp4`]
    : null;

  const galerijFotos = import.meta.glob(
    "../../../lib/assets/pictures/talent-night/*.webp",
    { eager: true, import: "default" }
  );
  // carrousel, zelfde werking als bij de crew op de homepage
  let galerijLijst = $state();
  let galerijBegin = $state(true);
  let galerijEind = $state(false);

  function galerijScrollStatus() {
    if (!galerijLijst) return;
    galerijBegin = galerijLijst.scrollLeft <= 4;
    galerijEind =
      galerijLijst.scrollLeft + galerijLijst.clientWidth >=
      galerijLijst.scrollWidth - 4;
  }

  function galerijBlader(richting) {
    if (!galerijLijst) return;
    const kaart = galerijLijst.querySelector(".dp-kaart");
    const stap = kaart ? kaart.getBoundingClientRect().width + 28 : 280;
    const aantal = Math.max(1, Math.floor(galerijLijst.clientWidth / stap) - 1);
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    galerijLijst.scrollBy({
      left: richting * stap * aantal,
      behavior: rustig ? "auto" : "smooth",
    });
  }

  const schaduwKleuren = ["purple", "orange", "cream"];

  const galerij = (dienst.galerij ?? []).map((g) => ({
    ...g,
    src: galerijFotos[`../../../lib/assets/pictures/talent-night/${g.foto}.webp`],
  }));
</script>

<svelte:head>
  <title>{dienst.heading} — Artquake</title>
</svelte:head>

<header class="dp-header">
  <a class="dp-brand" href={base || "/"}>
    <img class="dp-logo" src={logo} alt="Artquake — creative space" />
  </a>
</header>

<section class="dp-intro bg-{dienst.bg}">
  <span class="dp-id">{dienst.id}</span>
  <h1 class="dp-title">{dienst.heading}</h1>
  <p class="dp-tagline">{dienst.intro}</p>
</section>

<section
  class="dp-body"
  class:dp-body-video={video}
  class:dp-body-galerij={galerij.length}
>
  {#if video}
    <figure class="dp-video">
      <figcaption>AFTERMOVIE</figcaption>
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={video} controls playsinline preload="metadata"></video>
    </figure>
  {/if}
  <div class="dp-body-tekst">
    {#each dienst.text.split("\n\n") as alinea}
      <p class="dp-text">{alinea}</p>
    {/each}
    <a class="dp-cta" href="{base}/#doe-mee">DOE MEE</a>
  </div>
</section>

{#if galerij.length}
  <section class="dp-galerij" aria-label="Foto's van {dienst.heading}">
    <div class="dp-galerij-top">
      <h2 class="dp-galerij-kop">IN BEELD</h2>
      <div class="dp-nav">
        <button
          type="button"
          class="dp-nav-knop"
          aria-label="Vorige foto's"
          disabled={galerijBegin}
          onclick={() => galerijBlader(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button
          type="button"
          class="dp-nav-knop"
          aria-label="Volgende foto's"
          disabled={galerijEind}
          onclick={() => galerijBlader(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
    <ul class="dp-carrousel" bind:this={galerijLijst} onscroll={galerijScrollStatus}>
      {#each galerij as g, i}
        <li class="dp-kaart dp-schaduw-{schaduwKleuren[i % 3]}">
          <img src={g.src} alt="" loading="lazy" />
          <span class="dp-kaart-titel">{g.titel}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .dp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 40px;
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .dp-brand {
    display: block;
  }
  .dp-logo {
    height: 80px;
    width: auto;
    display: block;
  }

  .dp-intro {
    padding: 40px 40px 64px;
  }
  .bg-dark {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .bg-cream {
    background: var(--color-fg);
    color: var(--color-bg);
  }
  .bg-orange {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .bg-purple {
    background: var(--color-primary);
    color: var(--color-fg);
  }
  .dp-id {
    display: block;
    font:
      700 13px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
    margin-bottom: 18px;
  }
  .dp-title {
    margin: 0 0 18px;
    font-family: var(--font-display);
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(26px, 8.4vw, 92px);
    overflow-wrap: break-word;
    line-height: 0.9;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }
  .dp-tagline {
    margin: 0;
    max-width: 640px;
    font:
      400 16px/1.5 "Space Mono",
      monospace;
  }

  .dp-body {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 56px 40px 96px;
  }
  /* volgt er een fotogalerij, dan minder ruimte onder de knop */
  .dp-body-galerij {
    padding-bottom: 44px;
  }
  .dp-text {
    max-width: 680px;
    margin: 0 0 40px;
    font:
      400 15px/1.7 "Space Mono",
      monospace;
    opacity: 0.9;
  }
  .dp-cta {
    display: inline-block;
    padding: 14px 32px;
    background: var(--color-fg);
    color: var(--color-bg);
    border-radius: 26px;
    font:
      800 14px/1 "Archivo",
      sans-serif;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .dp-cta:hover {
    opacity: 0.8;
  }

  /* met video: eerst de video over de volle breedte, daaronder de tekst */
  .dp-body-video .dp-video {
    max-width: 980px;
    margin: 0 12px 60px 0;
  }
  .dp-text + .dp-text {
    margin-top: -20px;
  }
  .dp-video {
    position: relative;
  }
  .dp-video video {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    box-shadow: 12px 12px 0 var(--color-primary);
  }
  .dp-video figcaption {
    margin-bottom: 28px;
    color: var(--color-accent);
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }

  /* fotocarrousel, in dezelfde stijl als de crew op de homepage */
  .dp-galerij {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 0 40px 96px;
  }
  .dp-galerij-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
  }
  .dp-galerij-kop {
    margin: 0;
    color: var(--color-accent);
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }
  .dp-nav {
    flex: none;
    display: flex;
    gap: 10px;
  }
  .dp-nav-knop {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    background: var(--color-accent);
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s;
  }
  .dp-nav-knop svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: var(--color-bg);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .dp-nav-knop:hover:not(:disabled) {
    background: var(--color-fg);
  }
  .dp-nav-knop:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .dp-carrousel {
    list-style: none;
    margin: 0 -40px;
    padding: 0 40px 16px;
    display: flex;
    gap: 28px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 40px;
    scrollbar-width: none;
  }
  .dp-carrousel::-webkit-scrollbar {
    display: none;
  }
  .dp-kaart {
    position: relative;
    flex: none;
    width: clamp(220px, 21vw, 290px);
    aspect-ratio: 5 / 7;
    overflow: hidden;
    scroll-snap-align: start;
    background: #1b1b1b;
    box-shadow: 10px 10px 0 var(--color-fg);
  }
  .dp-schaduw-purple {
    box-shadow: 10px 10px 0 var(--color-primary);
  }
  .dp-schaduw-orange {
    box-shadow: 10px 10px 0 var(--color-accent);
  }
  .dp-kaart img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .dp-kaart-titel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 70px 14px 20px;
    background: linear-gradient(transparent, rgba(11, 11, 11, 0.92) 62%);
    color: var(--color-fg);
    text-align: center;
    font-weight: 900;
    font-stretch: 110%;
    font-size: clamp(17px, 1.5vw, 22px);
    line-height: 1.05;
  }

  @media (max-width: 640px) {
    .dp-galerij {
      padding-left: 20px;
      padding-right: 20px;
    }
    .dp-carrousel {
      margin: 0 -20px;
      padding: 0 20px 16px;
      scroll-padding: 0 20px;
    }
    .dp-kaart {
      width: 68vw;
    }
    .dp-header,
    .dp-intro,
    .dp-body {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
</style>
