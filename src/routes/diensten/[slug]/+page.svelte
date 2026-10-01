<script>
  import { base } from "$app/paths";
  import logo from "$lib/assets/artquake-logo.avif";
  import PandSectie from "$lib/components/PandSectie.svelte";

  let { data } = $props();
  const dienst = data.dienst;
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

<section class="dp-body">
  {#if dienst.pand}
    <PandSectie />
  {:else}
    <p class="dp-text">{dienst.text}</p>
    <a class="dp-cta" href="{base}/#doe-mee">DOE MEE</a>
  {/if}
</section>

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
    font-size: clamp(44px, 7vw, 92px);
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

  @media (max-width: 640px) {
    .dp-header,
    .dp-intro,
    .dp-body {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
</style>
