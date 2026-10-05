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
  <a class="dp-back" href="{base}/#services">WAT WE DOEN</a>
</header>

<section class="dp-intro bg-{dienst.bg}">
  <span class="dp-id">{dienst.id}</span>
  <h1 class="dp-title">{dienst.heading}</h1>
  <p class="dp-tagline">{dienst.intro}</p>
</section>

<section class="dp-body" class:dp-body-video={video}>
  <div class="dp-body-tekst">
    <p class="dp-text">{dienst.text}</p>
    <a class="dp-cta" href="{base}/#doe-mee">DOE MEE</a>
  </div>
  {#if video}
    <figure class="dp-video">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={video} controls playsinline preload="metadata"></video>
      <figcaption>AFTERMOVIE</figcaption>
    </figure>
  {/if}
</section>

{#if galerij.length}
  <section class="dp-galerij" aria-label="Foto's van {dienst.heading}">
    <h2 class="dp-galerij-kop">IN BEELD</h2>
    <ul class="dp-collage">
      {#each galerij as g, i}
        <li
          class="dp-collage-item dp-schaduw-{i % 3}"
          style:aspect-ratio={g.verhouding}
        >
          <img src={g.src} alt={g.titel} loading="lazy" />
          <span class="dp-galerij-titel">{g.titel}</span>
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
  .dp-back {
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.12em;
    color: inherit;
    text-decoration: none;
    white-space: nowrap;
    /* ruimte voor de menuknop rechtsboven */
    margin-right: 56px;
  }
  .dp-back:hover {
    opacity: 0.75;
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

  .dp-body-video {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 56px;
    align-items: center;
  }
  .dp-body-video .dp-text {
    margin-bottom: 32px;
  }
  .dp-video {
    position: relative;
    margin: 0 12px 0 0;
  }
  .dp-video video {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    box-shadow: 12px 12px 0 var(--color-primary);
  }
  /* het label hangt onder de video, zodat het midden van de video telt */
  .dp-video figcaption {
    position: absolute;
    top: calc(100% + 26px);
    left: 0;
    color: var(--color-accent);
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }

  @media (max-width: 900px) {
    .dp-body-video {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .dp-video {
      margin-bottom: 38px;
    }
  }

  .dp-galerij {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 0 40px 96px;
  }
  .dp-galerij-kop {
    margin: 0 0 28px;
    color: var(--color-accent);
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }
  /* Pinterest-indeling: kolommen met foto's van wisselende hoogte */
  .dp-collage {
    list-style: none;
    margin: 0;
    padding: 0 10px 0 0;
    columns: 3;
    column-gap: 30px;
  }
  .dp-collage-item {
    --schaduw: 10px;
    position: relative;
    margin: 0 0 30px;
    break-inside: avoid;
    background: #1b1b1b;
    box-shadow: var(--schaduw) var(--schaduw) 0 var(--color-primary);
  }
  .dp-schaduw-1 {
    box-shadow: var(--schaduw) var(--schaduw) 0 var(--color-accent);
  }
  .dp-schaduw-2 {
    box-shadow: var(--schaduw) var(--schaduw) 0 var(--color-fg);
  }
  .dp-collage-item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .dp-galerij-titel {
    position: absolute;
    left: 0;
    bottom: 0;
    max-width: 100%;
    box-sizing: border-box;
    overflow-wrap: anywhere;
    padding: 8px 12px;
    background: var(--color-bg);
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .dp-galerij {
      padding-left: 20px;
      padding-right: 20px;
    }
    .dp-collage {
      padding-right: 6px;
      columns: 2;
      column-gap: 18px;
    }
    .dp-collage-item {
      --schaduw: 6px;
      margin-bottom: 18px;
    }
    .dp-galerij-titel {
      padding: 6px 9px;
      font-size: 9px;
    }
    .dp-header,
    .dp-intro,
    .dp-body {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
</style>
