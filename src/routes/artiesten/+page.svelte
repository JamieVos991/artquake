<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import logo from "$lib/assets/artquake-logo.avif";
  import { haalCollectieOp } from "$lib/publiekeData.js";
  import { artiestFotoPositie } from "$lib/data/fotoPosities.js";

  const bgVolgorde = ["dark", "purple", "orange", "cream"];
  const badgeVolgorde = {
    dark: "orange",
    purple: "cream",
    orange: "dark",
    cream: "purple",
  };

  const stapGrootte = 10;
  const filters = ["ALLE", "EXPO", "PODIUM"];

  let artiesten = $state([]);
  let geladen = $state(false);
  let zichtbaarAantal = $state(stapGrootte);
  let actieveFilter = $state("ALLE");
  let zoekterm = $state("");
  let zoekVeld = $state();

  let gefilterdeArtiesten = $derived.by(() => {
    const zoek = zoekterm.trim().toLowerCase();
    return artiesten.filter(
      (a) =>
        (actieveFilter === "ALLE" ||
          (a.type ?? "").toUpperCase() === actieveFilter) &&
        // zoekt in naam en omschrijving (bv. "band" of "singer-songwriter")
        (!zoek ||
          a.naam.toLowerCase().includes(zoek) ||
          (a.beschrijving ?? "").toLowerCase().includes(zoek))
    );
  });
  let getoondeArtiesten = $derived(gefilterdeArtiesten.slice(0, zichtbaarAantal));

  function kiesFilter(f) {
    actieveFilter = f;
    zichtbaarAantal = stapGrootte;
  }

  function laadMeer() {
    zichtbaarAantal += stapGrootte;
  }

  onMount(() => {
    haalCollectieOp("artiesten")
      .then((docs) => {
        artiesten = docs.filter((a) => a.naam).sort(() => Math.random() - 0.5);
      })
      .catch(() => {})
      .finally(() => (geladen = true));
  });
</script>

<svelte:head>
  <title>Artiesten | Artquake</title>
  <meta
    name="description"
    content="Ontdek de jonge makers van Artquake: bands, singer-songwriters, dansers, DJ's en beeldend kunstenaars uit Dijk & Waard en omgeving. Ook te boeken voor je event."
  />
</svelte:head>

<header class="ap-header">
  <a class="ap-brand" href={base || "/"}>
    <img class="ap-logo" src={logo} alt="Artquake, naar home" />
  </a>
</header>

<section class="ap-intro">
  <h1 class="ap-title">JONG TALENT<br /><em>AAN HET WOORD.</em></h1>
</section>

<section class="ap-section" aria-label="Alle artiesten">
  <header class="ap-section-head">
    <h2 class="ap-section-eyebrow">ALLE ARTIESTEN</h2>
    <span class="ap-section-rule"></span>
    <span class="ap-section-count" aria-live="polite"
      >{gefilterdeArtiesten.length} {gefilterdeArtiesten.length === 1 ? "MAKER" : "MAKERS"}</span
    >
  </header>

  <div class="ap-balk">
    <fieldset class="ap-filters">
      <legend class="ap-visueel-verborgen">Filter op categorie</legend>
      {#each filters as f}
        <button
          type="button"
          class="ap-filter"
          class:is-active={actieveFilter === f}
          aria-pressed={actieveFilter === f}
          onclick={() => kiesFilter(f)}
        >
          {f}
        </button>
      {/each}
    </fieldset>

    <search class="ap-zoek">
      <label class="ap-visueel-verborgen" for="artiest-zoek">Zoek een artiest</label>
      <svg class="ap-zoek-icoon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5 21 21" />
      </svg>
      <input
        id="artiest-zoek"
        type="search"
        placeholder="ZOEK EEN ARTIEST"
        autocomplete="off"
        bind:this={zoekVeld}
        bind:value={zoekterm}
        oninput={() => (zichtbaarAantal = stapGrootte)}
      />
      {#if zoekterm}
        <button
          type="button"
          class="ap-zoek-wis"
          aria-label="Zoekopdracht wissen"
          onclick={() => {
            zoekterm = "";
            zichtbaarAantal = stapGrootte;
            zoekVeld?.focus();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      {/if}
    </search>
  </div>

  {#if !geladen}
    <ul class="ap-grid" aria-hidden="true">
      {#each Array(6) as _, i}
        <li class="ap-card ap-skel-card">
          <div class="ap-skel ap-skel-photo"></div>
          <div class="ap-skel ap-skel-line ap-skel-name"></div>
          <div class="ap-skel ap-skel-line ap-skel-desc"></div>
        </li>
      {/each}
    </ul>
  {:else if artiesten.length === 0}
    <p class="ap-empty">Binnenkort meer artiesten.</p>
  {:else if gefilterdeArtiesten.length === 0}
    <p class="ap-empty">
      {zoekterm.trim()
        ? `Geen artiesten gevonden voor "${zoekterm.trim()}".`
        : "Geen artiesten in deze categorie."}
    </p>
  {:else}
    <ul class="ap-grid">
      {#each getoondeArtiesten as a, i (a.id)}
        {@const bg = bgVolgorde[i % bgVolgorde.length]}
        <li class="ap-card bg-{bg}">
          <figure class="ap-photo">
            {#if a.imageUrl}
              <img
                class="ap-img"
                src={a.imageUrl}
                alt=""
                loading="lazy"
                style:object-position={artiestFotoPositie(a)}
              />
            {:else}
              <figcaption>[ ARTIESTFOTO<br />1200×1500 ]</figcaption>
            {/if}
            {#if a.type}
              <span class="ap-badge badge-{badgeVolgorde[bg]}">{a.type}</span>
            {/if}
          </figure>
          <h3 class="ap-name">{a.naam}</h3>
          {#if a.beschrijving}
            <p class="ap-desc">{a.beschrijving}</p>
          {/if}
          {#if a.instagram}
            <a
              class="ap-profiel"
              href={a.instagram}
              target="_blank"
              rel="noopener">PROFIEL</a
            >
          {/if}
        </li>
      {/each}
    </ul>

    {#if zichtbaarAantal < gefilterdeArtiesten.length}
      <button class="ap-load-more" type="button" onclick={laadMeer}
        >LAAD MEER</button
      >
    {/if}
  {/if}
</section>

<style>
  /* header */
  .ap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 40px;
    background: var(--color-bg);
  }
  .ap-brand {
    display: block;
  }
  .ap-logo {
    height: 80px;
    width: auto;
    display: block;
  }
  /* intro */
  .ap-intro {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 20px 40px 64px;
  }
  .ap-title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 900;
    font-stretch: 110%;
    font-size: clamp(44px, 7vw, 92px);
    line-height: 0.9;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }
  .ap-title em {
    color: var(--color-primary-light);
    font-style: normal;
  }

  /* section */
  .ap-section {
    background: var(--color-fg);
    padding: 48px 40px 72px;
  }
  .ap-section-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 0 8px 26px;
    color: var(--color-bg);
  }
  .ap-section-eyebrow {
    margin: 0;
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
    color: var(--color-primary);
  }
  .ap-section-rule {
    flex: 1;
    height: 2px;
    background: var(--color-bg);
  }
  .ap-section-count {
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }

  /* fieldset zonder de standaard rand en ruimte van de browser */
  /* filters links, zoeken rechts; op een smal scherm onder elkaar */
  .ap-balk {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px 24px;
    padding: 0 8px 32px;
  }
  .ap-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-width: 0;
    margin: 0;
    border: 0;
    padding: 0;
  }
  .ap-filter {
    padding: 10px 22px;
    border: 1.5px solid var(--color-bg);
    border-radius: 26px;
    background: transparent;
    color: var(--color-bg);
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .ap-filter:hover {
    opacity: 0.75;
  }
  .ap-filter.is-active {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  /* zoekveld: zwarte pil met oranje vergrootglas, paarse schaduw bij focus */
  .ap-zoek {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 260px;
    max-width: 380px;
  }
  .ap-zoek-icoon {
    position: absolute;
    left: 18px;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 2.5;
    stroke-linecap: round;
    pointer-events: none;
  }
  .ap-zoek input {
    width: 100%;
    height: 48px;
    padding: 0 48px 0 48px;
    border: 2px solid var(--color-bg);
    border-radius: 26px;
    background: var(--color-bg);
    color: var(--color-fg);
    font:
      700 13px/1 "Space Mono",
      monospace;
    letter-spacing: 0.08em;
    transition: box-shadow 0.15s;
  }
  .ap-zoek input::placeholder {
    color: #8d8d8d;
  }
  /* het eigen wis-kruisje van de browser; we hebben een eigen knop */
  .ap-zoek input::-webkit-search-cancel-button {
    appearance: none;
  }
  .ap-zoek input:focus {
    outline: none;
    box-shadow: 5px 5px 0 var(--color-primary);
  }
  .ap-zoek-wis {
    position: absolute;
    right: 8px;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
  }
  .ap-zoek-wis svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: var(--color-bg);
    stroke-width: 2.5;
    stroke-linecap: round;
  }
  .ap-zoek-wis:hover {
    background: var(--color-fg);
  }
  .ap-zoek-wis:focus-visible {
    outline: 2px solid var(--color-fg);
    outline-offset: 2px;
  }
  .ap-visueel-verborgen {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .ap-empty {
    padding: 40px 8px;
    text-align: center;
    font:
      400 14px/1.6 "Space Mono",
      monospace;
    color: var(--color-bg);
    opacity: 0.7;
  }

  /* grid */
  .ap-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
  .ap-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ap-card.bg-cream {
    border: 1px solid var(--color-bg);
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

  .ap-photo {
    position: relative;
    height: 280px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(
      45deg,
      rgba(20, 20, 20, 0.16) 0 12px,
      rgba(20, 20, 20, 0.06) 12px 24px
    );
    overflow: hidden;
  }
  .bg-dark .ap-photo {
    background: repeating-linear-gradient(
      45deg,
      #242424 0 12px,
      #1c1c1c 12px 24px
    );
  }
  .bg-purple .ap-photo {
    background: repeating-linear-gradient(
      45deg,
      rgba(20, 20, 20, 0.22) 0 12px,
      rgba(20, 20, 20, 0.08) 12px 24px
    );
  }
  .ap-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .ap-photo figcaption {
    font:
      400 11px/1.4 "Space Mono",
      monospace;
    text-align: center;
    letter-spacing: 0.08em;
    padding: 0 12px;
  }
  .ap-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: 4px;
  }
  .badge-dark {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .badge-cream {
    background: var(--color-fg);
    color: var(--color-bg);
  }
  .badge-orange {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .badge-purple {
    background: var(--color-primary);
    color: var(--color-fg);
  }

  .ap-name {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 900;
    font-stretch: 110%;
    font-size: 26px;
    line-height: 1.1;
    /* extra ruimte zodat voor- en achternaam niet als één woord lezen */
    word-spacing: 0.3em;
    text-transform: uppercase;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }
  .ap-desc {
    margin: 0;
    font:
      400 13px/1.5 "Space Mono",
      monospace;
  }
  .ap-profiel {
    align-self: flex-start;
    margin-top: 4px;
    padding: 9px 16px;
    border: 1.5px solid currentColor;
    border-radius: 4px;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.1em;
    color: inherit;
    text-decoration: none;
  }
  .ap-profiel:hover {
    opacity: 0.7;
  }

  .ap-load-more {
    display: block;
    margin: 36px auto 0;
    padding: 14px 32px;
    background: var(--color-bg);
    color: var(--color-fg);
    border: none;
    border-radius: 26px;
    font:
      800 14px/1 "Archivo",
      sans-serif;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .ap-load-more:hover {
    opacity: 0.8;
  }

  /* skeleton loader */
  .ap-skel-card {
    background: #1a1a1a;
    cursor: default;
  }
  .ap-skel {
    background: linear-gradient(90deg, #242424 25%, #2e2e2e 37%, #242424 63%);
    background-size: 400% 100%;
    border-radius: 4px;
    animation: ap-shimmer 1.4s ease infinite;
  }
  .ap-skel-photo {
    height: 280px;
  }
  .ap-skel-line {
    height: 14px;
  }
  .ap-skel-name {
    width: 60%;
    height: 22px;
  }
  .ap-skel-desc {
    width: 85%;
  }
  @keyframes ap-shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ap-skel {
      animation: none;
    }
  }

  /* responsive */
  @media (max-width: 640px) {
    .ap-header,
    .ap-intro,
    .ap-section {
      padding-left: 20px;
      padding-right: 20px;
    }
    .ap-grid {
      grid-template-columns: 1fr;
    }
    .ap-zoek {
      flex-basis: 100%;
      max-width: none;
    }
  }
</style>
