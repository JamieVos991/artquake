<script>
  import { base } from "$app/paths";
  import { fade, fly } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import { collection, getDocs } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { navigatie } from "$lib/data/navigatie.js";
  import dansFoto from "$lib/assets/pictures/hero/meiden-die-dansen.avif";
  import zingFoto from "$lib/assets/pictures/hero/meid-die-zingt.avif";
  import optredenFoto from "$lib/assets/pictures/hero/optreden.avif";
  import zingenFoto from "$lib/assets/pictures/hero/meiden-die-zingen.avif";
  import tekenFoto from "$lib/assets/pictures/hero/meid-die-tekent.avif";
  import schrijfFoto from "$lib/assets/pictures/hero/meid-die-schrijft.avif";
  import interieurFoto from "$lib/assets/pictures/hero/interieur-tekening.avif";
  import pandFoto from "$lib/assets/pictures/pand/artquake-pand-voorkant.webp";

  const fotos = {
    dans: dansFoto,
    interieur: interieurFoto,
    optreden: optredenFoto,
    zingen: zingenFoto,
    teken: tekenFoto,
    pand: pandFoto,
    schrijf: schrijfFoto,
    zing: zingFoto,
  };
  const items = navigatie.map((it) => ({
    ...it,
    label: it.label.toUpperCase(),
    foto: fotos[it.foto],
  }));

  let open = $state(false);

  // menu schuift van rechts het scherm in; zonder beweging bij reduced motion
  function schuif(node, { uit = false } = {}) {
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rustig) return fade(node, { duration: 0 });
    return fly(node, {
      x: window.innerWidth,
      opacity: 1,
      duration: uit ? 320 : 520,
      easing: uit ? cubicIn : cubicOut,
    });
  }
  let hoverIndex = $state(-1);
  let agenda = $state([]);
  let agendaGeladen = $state(false);
  let knopEl = $state();

  const verborgen = $derived(
    ["/dashboard"].some((p) => page.url.pathname.startsWith(`${base}${p}`))
  );
  const huidigeIndex = $derived(
    items.findIndex((it) => {
      if (it.href.includes("#")) return false;
      const pad = page.url.pathname.replace(/\/$/, "");
      if (it.href === "/") return pad === base;
      return pad.startsWith(`${base}${it.href}`);
    })
  );
  const actieveIndex = $derived(hoverIndex >= 0 ? hoverIndex : Math.max(huidigeIndex, 0));

  async function laadAgenda() {
    if (agendaGeladen) return;
    try {
      const n = new Date();
      const vandaag = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
      const snap = await getDocs(collection(db, "agenda"));
      agenda = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => a.date && a.date >= vandaag)
        .sort((a, b) => `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`))
        .slice(0, 3);
    } catch {
      agenda = [];
    }
    agendaGeladen = true;
  }

  function openMenu() {
    open = true;
    hoverIndex = -1;
    laadAgenda();
  }

  function sluitMenu() {
    open = false;
    knopEl?.focus();
  }

  function tekstKleur(hex) {
    if (!hex) return "var(--color-fg)";
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#0b0b0b" : "#f4f1ea";
  }

  function formatDatum(d) {
    const [y, m, day] = d.split("-");
    return `${y}-${m}-${day}`;
  }

  $effect(() => {
    if (!open) return;
    const vorige = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && sluitMenu();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = vorige;
      window.removeEventListener("keydown", onKey);
    };
  });

  // sluit het menu na navigatie
  $effect(() => {
    page.url.href;
    open = false;
  });
</script>

{#if !verborgen}
  <button
    bind:this={knopEl}
    type="button"
    class="menu-knop"
    aria-label="Menu openen"
    aria-expanded={open}
    aria-controls="hoofdmenu"
    onclick={openMenu}
  >
    <span></span><span></span><span></span>
  </button>

  {#if open}
    <div
      class="menu-scrim"
      onclick={sluitMenu}
      aria-hidden="true"
      transition:fade={{ duration: 250 }}
    ></div>
    <div
      class="menu"
      id="hoofdmenu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      in:schuif
      out:schuif={{ uit: true }}
    >
      <nav class="menu-links" aria-label="Hoofdmenu">
        <span class="menu-pad" aria-hidden="true">/MENU</span>
        <ol class="menu-lijst" onmouseleave={() => (hoverIndex = -1)}>
          {#each items as it, i}
            <li
              class="menu-item"
              style:--i={i}
              class:is-huidig={i === huidigeIndex}
              class:is-actief={i === hoverIndex}
            >
              <a
                href="{base}{it.href}"
                onmouseenter={() => (hoverIndex = i)}
                onfocus={() => (hoverIndex = i)}
                onclick={() => (open = false)}
                aria-current={i === huidigeIndex ? "page" : undefined}
              >
                <span class="menu-nr">{String(i + 1).padStart(2, "0")}</span>
                <span class="menu-label">{it.label}</span>
              </a>
            </li>
          {/each}
        </ol>
        <figure class="menu-foto" aria-hidden="true">
          <span class="menu-foto-kader">
            {#each items as it, i}
              <img src={it.foto} alt="" class:zichtbaar={i === actieveIndex} />
            {/each}
          </span>
          <figcaption>{items[actieveIndex].info}</figcaption>
        </figure>
      </nav>

      <aside class="menu-rechts" aria-label="Agenda">
        <header class="menu-rechts-kop">
          <h2>NU IN DE AGENDA</h2>
        </header>
        <ol class="menu-agenda">
          {#if !agendaGeladen}
            {#each Array(3) as _}
              <li class="menu-event menu-skel" aria-hidden="true"><span></span><span></span></li>
            {/each}
          {:else if agenda.length === 0}
            <li class="menu-leeg">Binnenkort meer agenda items.</li>
          {:else}
            {#each agenda as ev (ev.id)}
              <li class="menu-event">
                <span
                  class="menu-thumb"
                  style:background={ev.kleur || "var(--color-primary)"}
                  style:color={tekstKleur(ev.kleur)}
                >
                  {#if ev.imageUrl}
                    <img src={ev.imageUrl} alt="" loading="lazy" />
                  {:else}
                    <span>{ev.date.slice(8, 10)}.{ev.date.slice(5, 7)}</span>
                  {/if}
                </span>
                <span class="menu-event-info">
                  <time datetime={ev.date}>{formatDatum(ev.date)}</time>
                  <strong>{ev.band}</strong>
                  <span class="menu-event-meta"
                    >{ev.place}{ev.place && ev.startTime ? " · " : ""}{ev.startTime ?? ""}</span
                  >
                </span>
              </li>
            {/each}
          {/if}
        </ol>
        <a class="menu-alles" href="{base}/#agenda" onclick={() => (open = false)}>BEKIJK DE HELE AGENDA</a>
      </aside>

      <button type="button" class="menu-sluit" aria-label="Menu sluiten" onclick={sluitMenu}>
        <span></span><span></span>
      </button>
    </div>
  {/if}
{/if}

<style>
  /* knop */
  .menu-knop {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 90;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    width: 56px;
    height: 56px;
    padding: 0 14px;
    background: var(--color-accent);
    border: 3px solid var(--color-bg);
    box-shadow: 4px 4px 0 var(--color-bg);
    cursor: pointer;
    transition: transform 0.12s;
  }
  .menu-knop:hover {
    transform: translate(-2px, -2px);
  }
  .menu-knop span {
    display: block;
    height: 3px;
    background: var(--color-bg);
  }
  .menu-knop span:nth-child(2) {
    width: 70%;
  }

  /* overlay */
  .menu-scrim {
    position: fixed;
    inset: 0;
    z-index: 95;
    background: rgba(11, 11, 11, 0.85);
    backdrop-filter: blur(3px);
  }
  .menu {
    position: fixed;
    inset: clamp(0px, 3vw, 40px);
    z-index: 100;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    --foto-b: clamp(150px, 15vw, 230px);
    --foto-r: clamp(24px, 3vw, 48px);
    overflow: hidden;
    background: var(--color-bg);
    border: 4px solid var(--color-bg);
    border-radius: 18px;
    box-shadow: 10px 10px 0 var(--color-primary);
  }
  /* items, foto en agenda schuiven na elkaar in */
  @keyframes menu-item-in {
    from {
      opacity: 0;
      transform: translateX(80px);
    }
  }
  @keyframes menu-fade {
    from {
      opacity: 0;
    }
  }
  .menu-item {
    animation: menu-item-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(0.22s + var(--i) * 0.055s);
  }
  .menu-foto {
    animation: menu-fade 0.4s ease-out 0.55s both;
  }
  .menu-rechts > * {
    animation: menu-item-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.35s both;
  }
  .menu-rechts > .menu-agenda {
    animation-delay: 0.45s;
  }
  .menu-rechts > .menu-alles {
    animation-delay: 0.55s;
  }
  @media (prefers-reduced-motion: reduce) {
    .menu-item,
    .menu-foto,
    .menu-rechts > * {
      animation: none;
    }
  }

  /* links: genummerde lijst */
  .menu-links {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 0;
    color: var(--color-fg);
    overflow-y: auto;
  }
  .menu-pad {
    position: absolute;
    top: 28px;
    left: 32px;
    color: var(--color-accent);
    font:
      400 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.1em;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }
  .menu-lijst {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .menu-item a {
    position: relative;
    display: grid;
    grid-template-columns: 56px 1fr;
    align-items: center;
    column-gap: 14px;
    padding: 2px calc(var(--foto-b) + var(--foto-r) + 32px) 2px clamp(24px, 5vw, 72px);
    color: inherit;
    text-decoration: none;
    outline: none;
  }
  .menu-nr {
    align-self: start;
    padding-top: 0.55em;
    font:
      700 15px/1 "Space Mono",
      monospace;
    letter-spacing: 0.04em;
  }
  .menu-label {
    position: relative;
    font-weight: 900;
    font-size: clamp(30px, 3.8vw, 58px);
    line-height: 1;
    letter-spacing: -0.03em;
  }
  /* huidige pagina: geel/oranje met doorgestreepte lijn */
  .menu-item.is-huidig .menu-nr,
  .menu-item.is-huidig .menu-label {
    color: var(--color-accent);
  }
  .menu-item.is-huidig .menu-label::after {
    content: "";
    position: absolute;
    left: -0.4em;
    right: -0.9em;
    top: 52%;
    height: 2px;
    background: var(--color-accent);
  }

  /* hover: band over de volle breedte */
  .menu-item.is-actief a {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .menu-item.is-actief .menu-nr,
  .menu-item.is-actief .menu-label {
    color: var(--color-bg);
  }
  .menu-item.is-actief .menu-label::after {
    background: var(--color-bg);
  }
  .menu-item a:focus-visible {
    outline: 3px solid var(--color-primary-light);
    outline-offset: -3px;
  }

  .menu-foto {
    position: absolute;
    right: var(--foto-r);
    top: 50%;
    z-index: 2;
    width: var(--foto-b);
    margin: 0;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .menu-foto-kader {
    position: relative;
    display: block;
    aspect-ratio: 4 / 5;
    border: 3px solid var(--color-fg);
    box-shadow: 8px 8px 0 var(--color-primary);
    background: var(--color-bg);
    overflow: hidden;
    transform: rotate(2deg);
  }
  .menu-foto figcaption {
    margin-top: 20px;
    color: var(--color-accent);
    font:
      400 11px/1.4 "Space Mono",
      monospace;
    letter-spacing: 0.08em;
  }
  .menu-foto img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .menu-foto img.zichtbaar {
    opacity: 1;
  }

  /* rechts: agenda */
  .menu-rechts {
    display: flex;
    flex-direction: column;
    padding: 72px clamp(24px, 3vw, 40px) 32px;
    background: var(--color-fg);
    color: var(--color-bg);
    overflow-y: auto;
  }
  .menu-rechts-kop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-bg);
  }
  .menu-rechts-kop h2 {
    margin: 0;
    font-weight: 900;
    font-size: clamp(20px, 1.8vw, 26px);
    letter-spacing: -0.01em;
  }
  .menu-agenda {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .menu-event {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--color-bg);
  }
  .menu-thumb {
    display: grid;
    place-items: center;
    aspect-ratio: 16 / 9;
    border: 1px solid rgba(11, 11, 11, 0.2);
    border-radius: 6px;
    overflow: hidden;
    font-weight: 900;
    font-size: clamp(22px, 2.4vw, 34px);
    letter-spacing: -0.02em;
  }
  .menu-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .menu-event-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .menu-event-info time,
  .menu-event-meta {
    font:
      400 10px/1.3 "Space Mono",
      monospace;
    letter-spacing: 0.06em;
  }
  .menu-event-info strong {
    font-weight: 900;
    font-size: 15px;
    line-height: 1.15;
    text-transform: uppercase;
  }
  .menu-event-meta {
    margin-top: auto;
    text-transform: uppercase;
  }
  .menu-leeg {
    padding: 24px 0;
    font:
      400 13px/1.5 "Space Mono",
      monospace;
  }
  .menu-skel span {
    display: block;
    border-radius: 6px;
    background: rgba(11, 11, 11, 0.08);
  }
  .menu-skel span:first-child {
    aspect-ratio: 16 / 9;
  }
  .menu-skel span:last-child {
    height: 40px;
  }
  .menu-alles {
    margin-top: 16px;
    color: var(--color-bg);
    text-decoration: none;
    font:
      400 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.08em;
  }
  .menu-alles:hover {
    color: var(--color-primary);
  }

  /* sluitknop */
  .menu-sluit {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 3;
    width: 44px;
    height: 44px;
    background: var(--color-bg);
    border: 2px solid var(--color-bg);
    border-radius: 50%;
    cursor: pointer;
  }
  .menu-sluit span {
    position: absolute;
    left: 10px;
    right: 10px;
    top: 50%;
    height: 2px;
    background: var(--color-fg);
    transform: rotate(45deg);
  }
  .menu-sluit span + span {
    transform: rotate(-45deg);
  }
  .menu-sluit:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  @media (max-width: 900px) {
    .menu {
      inset: 0;
      border-radius: 0;
      box-shadow: none;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      overflow-y: auto;
    }
    .menu-links {
      padding: 80px 0 40px;
      overflow: visible;
    }
    .menu-foto {
      display: none;
    }
    .menu-item a {
      grid-template-columns: 40px 1fr;
      padding-right: 24px;
    }
    .menu-rechts {
      padding-top: 32px;
      overflow: visible;
    }
    .menu-sluit {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
    .menu-sluit span {
      background: var(--color-bg);
    }
  }

  @media (max-width: 640px) {
    .menu-knop {
      top: 14px;
      right: 14px;
      width: 48px;
      height: 48px;
      padding: 0 11px;
    }
  }
</style>
