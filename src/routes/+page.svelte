<script>
  import { onMount } from "svelte";
  import logo from "$lib/assets/artquake-logo.avif";
  import { base } from "$app/paths";
  import PandSectie from "$lib/components/PandSectie.svelte";
  import { collection, onSnapshot } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { diensten as services } from "$lib/data/diensten.js";
  import { artiestFotoPositie } from "$lib/data/fotoPosities.js";

  let agendaItems = $state([]);
  let agendaGeladen = $state(false);
  let uitgelichteArtiesten = $state([]);
  let aantalArtiesten = $state(0);
  let artiestenGeladen = $state(false);

  function kiesWillekeurig(lijst, aantal) {
    const shuffled = [...lijst].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, aantal);
  }

  function vandaagAlsDatum() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }

  onMount(() => {
    const unsubscribe = onSnapshot(
      collection(db, "agenda"),
      (snapshot) => {
        const vandaag = vandaagAlsDatum();
        agendaItems = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.date && a.date >= vandaag)
          .sort((a, b) =>
            `${a.date}${a.startTime ?? ""}`.localeCompare(
              `${b.date}${b.startTime ?? ""}`
            )
          );
        agendaGeladen = true;
      },
      () => {
        agendaGeladen = true;
      }
    );

    const unsubscribeArtiesten = onSnapshot(
      collection(db, "artiesten"),
      (snapshot) => {
        const alleArtiesten = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.naam);
        aantalArtiesten = alleArtiesten.length;
        uitgelichteArtiesten = kiesWillekeurig(alleArtiesten, 3);
        artiestenGeladen = true;
      },
      () => {
        artiestenGeladen = true;
      }
    );

    return () => {
      unsubscribe();
      unsubscribeArtiesten();
    };
  });

  function formatAgendaDatum(d) {
    if (!d) return "";
    const [, m, day] = d.split("-");
    return `${day}.${m}`;
  }

  function agendaTekstKleur(hex) {
    if (!hex) return "var(--color-fg)";
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#0b0b0b" : "#f4f1ea";
  }

  const heroModules = import.meta.glob("../lib/assets/pictures/hero/*.avif", {
    eager: true,
    import: "default",
  });
  const heroImages = Object.values(heroModules);
  const firstHeroImage = heroImages[0];

  let heroIndex = $state(0);
  let heroRevealed = $state(heroImages.length > 0 ? 1 : 0);

  $effect(() => {
    if (heroImages.length <= 1) return;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const id = idle(() => {
      heroRevealed = heroImages.length;
    });
    return () => cancelIdle(id);
  });

  $effect(() => {
    if (heroImages.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      heroIndex = (heroIndex + 1) % heroImages.length;
    }, 3000);
    return () => clearInterval(id);
  });

  const ticks = [
    "OPTREDENS",
    "EXPOSITIES",
    "EVENTS",
    "WORKSHOPS",
    "MASTERCLASSES",
    "COACHING",
    "PROMOTIE",
  ];

  const talentBgVolgorde = ["dark", "cream", "purple"];

  const crewBgVolgorde = ["purple", "orange", "cream"];

  function schudCrewKleuren(aantal, kolommen = 3) {
    const kleuren = [];
    for (let i = 0; i < aantal; i++) {
      const verboden = new Set();
      if (i > 0) verboden.add(kleuren[i - 1]);
      if (i >= kolommen) verboden.add(kleuren[i - kolommen]);
      const opties = crewBgVolgorde.filter((k) => !verboden.has(k));
      kleuren.push(opties[Math.floor(Math.random() * opties.length)]);
    }
    return kleuren;
  }

  const crewFotos = import.meta.glob("../lib/assets/pictures/crew/*.webp", {
    eager: true,
    import: "default",
  });
  const crewFoto = (naam) =>
    crewFotos[`../lib/assets/pictures/crew/${naam}.webp`];

  const crewRuw = [
    {
      name: "Mado de Vries",
      fotoPositie: "70% 50%",
      role: "Oprichtster",
      imageUrl: crewFoto("mado"),
    },
    {
      name: "Nikki",
      fotoPositie: "25%",
      role: "Organisatie",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/artquake-6fceb.firebasestorage.app/o/crew-images%2Fnikki-hardaway.jpg?alt=media&token=b668c580-9754-4e66-9e9c-0c5da1215bb5",
    },
    {
      name: "Jasmijn",
      fotoPositie: "31%",
      role: "Organisatie",
      imageUrl: crewFoto("jasmijn"),
    },
    {
      name: "Jens",
      fotoPositie: "30%",
      role: "Organisatie",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/artquake-6fceb.firebasestorage.app/o/crew-images%2Fjens-dijkstra.jpeg?alt=media&token=2e0a0c72-a15f-4ae8-896b-8310f44025e9",
    },
    {
      name: "Britt",
      fotoPositie: "43%",
      role: "Coach / Docent",
      imageUrl: crewFoto("britt"),
    },
    {
      name: "Nina",
      fotoPositie: "18%",
      role: "Organisatie",
      imageUrl: crewFoto("nina"),
    },
    {
      name: "Franka",
      fotoPositie: "30%",
      role: "Organisatie",
      imageUrl: crewFoto("franka"),
    },
    {
      name: "Dewi",
      fotoPositie: "16%",
      role: "Organisatie / Coach",
      imageUrl: crewFoto("dewi"),
    },
    {
      name: "Chris",
      fotoPositie: "29%",
      role: "Presentator",
      imageUrl: crewFoto("chris"),
    },
    {
      name: "Eline",
      fotoPositie: "10%",
      role: "Organisatie / Docent",
      imageUrl: crewFoto("eline"),
    },
    {
      name: "Mike",
      fotoPositie: "8%",
      role: "Organisatie / Fotograaf",
      imageUrl: crewFoto("mike"),
    },
    {
      name: "Mikey",
      fotoPositie: "31%",
      role: "Organisatie",
      imageUrl: crewFoto("mikey"),
    },
    {
      name: "Santi",
      fotoPositie: "10%",
      role: "Organisatie",
      imageUrl: crewFoto("santi"),
    },
    {
      name: "Thomas",
      fotoPositie: "2%",
      role: "Fotograaf",
      imageUrl: crewFoto("thomas"),
    },
    {
      name: "Emre",
      fotoPositie: "33%",
      role: "Coach / Docent",
      imageUrl: crewFoto("emre"),
    },
    {
      name: "Moon",
      fotoPositie: "10%",
      role: "Organisatie / Docent",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/artquake-6fceb.firebasestorage.app/o/artiesten-images%2Fmoon-smit.jpeg?alt=media&token=aae5035f-6a11-4239-8149-088053037bec",
    },
  ];
  let crewLijst = $state();
  let crewBegin = $state(true);
  let crewEind = $state(false);

  function crewScrollStatus() {
    if (!crewLijst) return;
    crewBegin = crewLijst.scrollLeft <= 4;
    crewEind =
      crewLijst.scrollLeft + crewLijst.clientWidth >= crewLijst.scrollWidth - 4;
  }

  function crewBlader(richting) {
    if (!crewLijst) return;
    const kaart = crewLijst.querySelector(".crew-card");
    const stap = kaart ? kaart.getBoundingClientRect().width + 28 : 280;
    const aantal = Math.max(1, Math.floor(crewLijst.clientWidth / stap) - 1);
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    crewLijst.scrollBy({
      left: richting * stap * aantal,
      behavior: rustig ? "auto" : "smooth",
    });
  }

  const crewKleuren = schudCrewKleuren(crewRuw.length, 4);
  const crew = crewRuw.map((c, i) => {
    const bg = crewKleuren[i];
    return { ...c, bg, roleColor: bg === "cream" ? "purple" : undefined };
  });
</script>

<svelte:head>
  <title>Artquake — Jong talent laat zich zien en horen</title>
  {#if firstHeroImage}
    <link rel="preload" as="image" href={firstHeroImage} fetchpriority="high" />
  {/if}
</svelte:head>

<header class="hero-shell">
  <a class="brand" href={base}>
    <img class="brand-logo" src={logo} alt="Artquake — creative space" />
  </a>

  <section class="hero" id="hero" aria-label="Introductie">
    <figure class="hero-image">
      {#each heroImages as src, i}
        {#if i < heroRevealed}
          <img
            class="hero-photo"
            class:active={i === heroIndex}
            {src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchpriority={i === 0 ? "high" : undefined}
          />
        {/if}
      {/each}
      {#if heroImages.length === 0}
        <figcaption>Drop hero foto — publiek / artiest, 2400×1600</figcaption>
      {/if}
    </figure>
    <h1 class="hero-copy">
      <span class="hero-line hero-line-orange">JONG TALENT</span>
      <span class="hero-line hero-line-cream">LAAT ZICH ZIEN EN HOREN</span>
    </h1>
  </section>
</header>

<main class="page-main">
  <p class="stripe-bar" aria-hidden="true">
    <span class="stripe stripe-orange"></span>
    <span class="stripe stripe-purple"></span>
    <span class="stripe stripe-cream"></span>
    <span class="stripe stripe-dark"></span>
    <span class="stripe stripe-orange"></span>
    <span class="stripe stripe-purple"></span>
  </p>

  <section class="mission" aria-label="Missie">
    <h2 class="mission-title">
      WIJ GEVEN JONGE MAKERS EEN <span class="hl-purple">PODIUM</span>, EEN
      <span class="hl-purple-dark">NETWERK</span> EN EEN FLINKE
      <span class="hl-orange-block">DUW</span>.
    </h2>
    <aside class="mission-side">
      <p>
        Artquake biedt oefenruimtes, organiseert optredens, exposities, events,
        workshops, masterclasses, lessen, coaching en promotie. Alles wat je
        nodig hebt om jezelf verder te ontwikkelen — behalve slaap.
      </p>
      <p class="mission-stats">339+ MAKERS</p>
    </aside>
  </section>

  <section class="services" id="services" aria-label="Wat we doen">
    <header class="section-head">
      <h2 class="section-eyebrow eyebrow-orange">WAT WE DOEN</h2>
      <span class="section-rule"></span>
    </header>
    <ul class="services-grid">
      {#each services as s}
        <li
          class="service-card bg-{s.bg}"
          class:service-big={s.big}
          class:service-wide={s.wide}
          class:service-outline={s.outline}
          class:service-long={s.long}
          class:service-full={s.full}
        >
          <span class="service-id">{s.id}</span>
          <h3 class="service-title">
            {#each s.title.split("\n") as line, i}{#if i > 0}<br
                />{/if}{line}{/each}
          </h3>
          <a
            class="service-link"
            href={s.pand ? "#pand" : `${base}/diensten/${s.slug}`}
            aria-label="{s.heading} — lees meer"
          ></a>
        </li>
      {/each}
    </ul>
  </section>

  <section class="agenda" id="agenda" aria-label="Agenda">
    <header class="agenda-head">
      <h2 class="agenda-title">AGENDA</h2>
    </header>
    <ol class="agenda-list">
      {#if !agendaGeladen}
        {#each Array(3) as _}
          <li class="agenda-row skel-row" aria-hidden="true">
            <span class="skel skel-date"></span>
            <span class="skel skel-name"></span>
            <span class="skel skel-meta"></span>
            <span class="skel skel-type"></span>
          </li>
        {/each}
      {:else if agendaItems.length === 0}
        <li class="agenda-empty">Binnenkort meer agenda-items.</li>
      {:else}
        {#each agendaItems as ev (ev.id)}
          <li
            class="agenda-row"
            style="background:{ev.kleur ||
              'var(--color-bg)'}; color:{agendaTekstKleur(ev.kleur)}"
          >
            <time class="agenda-date" datetime={ev.date}
              >{formatAgendaDatum(ev.date)}</time
            >
            <h3 class="agenda-name">{ev.band}</h3>
            <p class="agenda-meta">
              {ev.place}{ev.place && ev.startTime
                ? " · "
                : ""}{ev.startTime}{ev.endTime ? `–${ev.endTime}` : ""}
            </p>
            <span class="agenda-type">{ev.type}</span>
          </li>
        {/each}
      {/if}
    </ol>
  </section>

  <section class="talent" id="talent" aria-label="Makers van nu">
    <header class="section-head section-head-dark">
      <h2 class="section-eyebrow eyebrow-purple">MAKERS VAN NU</h2>
      <span class="section-rule section-rule-dark"></span>
      <span class="section-count">{aantalArtiesten} MAKERS</span>
    </header>
    <ul class="talent-grid">
      {#if !artiestenGeladen}
        {#each Array(3) as _}
          <li class="talent-card skel-card" aria-hidden="true">
            <div class="skel skel-photo"></div>
            <div class="skel skel-talent-name"></div>
          </li>
        {/each}
      {:else}
        {#each uitgelichteArtiesten as t, i (t.id)}
          <li
            class="talent-card bg-{talentBgVolgorde[
              i % talentBgVolgorde.length
            ]}"
          >
            <figure class="talent-photo">
              {#if t.imageUrl}
                <img
                  class="talent-img"
                  src={t.imageUrl}
                  alt=""
                  loading="lazy"
                  style:object-position={artiestFotoPositie(t)}
                />
              {:else}
                <figcaption>[ ARTIESTFOTO<br />1200×1500 ]</figcaption>
              {/if}
            </figure>
            <hgroup class="talent-meta">
              <h3 class="talent-name">{t.naam}</h3>
            </hgroup>
          </li>
        {/each}
      {/if}
    </ul>
    <a class="talent-more" href="{base}/artiesten">BEKIJK ALLE MAKERS</a>
  </section>

  <section class="crew" id="crew" aria-label="De crew">
    <header class="section-head">
      <h2 class="section-eyebrow eyebrow-orange">DE CREW</h2>
      <span class="section-rule"></span>
    </header>
    <div class="crew-kop">
      <h3 class="crew-title">
        SAMEN WERKEN WE <span class="hl-purple">HARD</span>, ZODAT MAKERS
        ALLEEN MAAR HOEVEN TE
        <span class="hl-orange-block">MAKEN</span>.
      </h3>
      <div class="crew-nav">
        <button
          type="button"
          class="crew-nav-knop"
          aria-label="Vorige crewleden"
          disabled={crewBegin}
          onclick={() => crewBlader(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button
          type="button"
          class="crew-nav-knop"
          aria-label="Volgende crewleden"
          disabled={crewEind}
          onclick={() => crewBlader(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
    <ul
      class="crew-grid"
      bind:this={crewLijst}
      onscroll={crewScrollStatus}
    >
      <li class="crew-card crew-intro">
        <p class="crew-intro-getal">{crew.length}</p>
        <p class="crew-intro-kop">CREWLEDEN</p>
        <p class="crew-intro-tekst">
          Organisatie, coaches, docenten, fotografen en een presentator. Samen
          houden zij Artquake draaiende.
        </p>
      </li>
      {#each crew as c}
        <li class="crew-card crew-schaduw-{c.bg}">
          {#if c.imageUrl}
            <img
              class="crew-img"
              src={c.imageUrl}
              alt=""
              loading="lazy"
              style:object-position={c.fotoPositie?.includes(" ")
                ? c.fotoPositie
                : `center ${c.fotoPositie ?? "center"}`}
            />
          {:else}
            <p class="crew-geen-foto">Foto volgt</p>
          {/if}
          <hgroup class="crew-meta">
            <h4 class="crew-name">{c.name}</h4>
            <p class="crew-role">{c.role}</p>
          </hgroup>
        </li>
      {/each}
    </ul>
  </section>

  <section class="video-section" id="pand" aria-label="Het Artquake-pand">
    <header class="section-head">
      <h2 class="section-eyebrow eyebrow-purple">HET ARTQUAKE-PAND</h2>
      <span class="section-rule"></span>
    </header>
    <h3 class="video-title">
      HOOR HET VAN <span class="hl-orange-block">DEWI</span> ZELF!
    </h3>
    <p class="video-sub">Dewi leidt je rond door het Artquake-pand 🩷</p>
    <PandSectie />
  </section>
</main>

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.page-main) {
    background: var(--color-bg);
    display: block;
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

  /* marquee */
  .marquee {
    margin: 0;
    height: 46px;
    background: var(--color-accent);
    color: var(--color-bg);
    display: flex;
    align-items: center;
    overflow: hidden;
    border-bottom: 4px solid var(--color-bg);
  }
  .marquee-track {
    display: flex;
    white-space: nowrap;
    animation: aq-march 26s linear infinite;
    font:
      700 13px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }
  .marquee-set {
    padding: 0 22px;
  }
  @keyframes aq-march {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  /* scroll-driven reveal animations */
  @keyframes aq-rise {
    from {
      transform: translateY(60px) rotate(-1.1deg);
    }
    to {
      transform: translateY(0) rotate(0);
    }
  }
  @keyframes aq-left {
    from {
      transform: translateX(-90px) rotate(2deg);
    }
    to {
      transform: translateX(0) rotate(0);
    }
  }
  @keyframes aq-right {
    from {
      transform: translateX(90px) rotate(-2deg);
    }
    to {
      transform: translateX(0) rotate(0);
    }
  }
  @keyframes aq-pop {
    from {
      transform: scale(0.86) rotate(-4deg);
    }
    to {
      transform: scale(1) rotate(0);
    }
  }
  @keyframes aq-skew {
    from {
      transform: translateY(40px) scale(1.06);
    }
    to {
      transform: translateY(0) scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .mission,
    .services-grid,
    .agenda-list,
    .talent-grid,
    .crew-grid,
    .cta-copy,
    .cta-form,
    .video-title,
    .video-sub {
      animation: none !important;
    }
  }

  /* hero always fills the viewport; nav floats on top of it */
  .hero-shell {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
  }

  /* brand */
  .brand {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 16px 30px;
  }
  .brand-logo {
    height: 80px;
    width: auto;
    display: block;
  }

  /* hero */
  .hero {
    position: relative;
    flex: 1 1 auto;
    min-height: 280px;
    background: var(--color-bg);
    border-bottom: 4px solid var(--color-fg);
    overflow: hidden;
  }
  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #151515;
  }
  .hero-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1.5s ease;
  }
  .hero-photo.active {
    opacity: 1;
  }
  .hero-image figcaption {
    color: #6b6b6b;
    font:
      400 12px/1.4 "Space Mono",
      monospace;
    text-align: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-photo {
      transition: none;
    }
  }
  .hero-image::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        180deg,
        rgba(11, 11, 11, 0.55) 0%,
        rgba(11, 11, 11, 0.15) 34%,
        rgba(11, 11, 11, 0.82) 100%
      ),
      radial-gradient(
        120% 80% at 70% 20%,
        rgba(138, 25, 232, 0.22),
        transparent 60%
      );
  }
  .hero-copy {
    position: absolute;
    left: 40px;
    right: 40px;
    bottom: 52px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hero-line {
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(46px, 9vw, 132px);
    line-height: 0.86;
    letter-spacing: -0.035em;
  }
  .hero-line-orange {
    color: var(--color-accent);
    text-shadow: 9px 9px 0 var(--color-bg);
  }
  .hero-line-cream {
    color: var(--color-fg);
    text-shadow: 9px 9px 0 var(--color-primary);
  }

  /* stripe bar */
  .stripe-bar {
    margin: 0;
    display: flex;
    height: 74px;
    border-bottom: 4px solid var(--color-fg);
  }
  .stripe {
    flex: 1;
  }
  .stripe-orange {
    background: var(--color-accent);
  }
  .stripe-purple {
    background: var(--color-primary);
  }
  .stripe-cream {
    background: var(--color-fg);
  }
  .stripe-dark {
    background: var(--color-bg);
  }

  /* mission */
  .mission {
    background: var(--color-fg);
    color: var(--color-bg);
    padding: clamp(36px, 5vw, 70px) clamp(16px, 4vw, 60px);
    border-bottom: 4px solid var(--color-bg);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(24px, 3vw, 40px);
    animation: aq-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 32%;
  }
  .mission-title {
    margin: 0;
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(40px, 6.4vw, 92px);
    line-height: 0.9;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }
  .hl-purple {
    color: var(--color-primary);
  }
  .hl-purple-dark {
    color: var(--color-primary-dark);
  }
  .hl-orange-block {
    background: var(--color-accent);
    padding: 0 8px;
  }
  .mission-side {
    display: flex;
    flex-direction: column;
    gap: 18px;
    font:
      400 13px/1.6 "Space Mono",
      monospace;
    margin: 0;
    max-width: 480px;
  }
  .mission-side p {
    margin: 0;
  }
  .mission-stats {
    font-weight: 700;
  }

  /* section head */
  .section-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 0 20px 26px;
    color: var(--color-fg);
  }
  .section-head-dark {
    padding: 0 8px 26px;
    color: var(--color-bg);
  }
  .section-eyebrow {
    margin: 0;
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }
  .eyebrow-orange {
    color: var(--color-accent);
  }
  .eyebrow-purple {
    color: var(--color-primary);
  }
  .section-rule {
    flex: 1;
    height: 2px;
    background: #242424;
  }
  .section-rule-dark {
    background: var(--color-bg);
  }
  .section-count {
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
  }

  /* services grid */
  .services {
    background: var(--color-bg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-fg);
    overflow-x: clip;
  }
  .services-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(150px, 190px);
    gap: 14px;
    animation: aq-pop linear both;
    animation-timeline: view();
    animation-range: cover 0px cover 260px;
  }
  .service-card {
    /* padding: 22px; */
    position: relative;
    display: flex;
    padding: 20px;
    flex-direction: column;
    justify-content: space-between;
    transition: opacity 0.15s;
  }
  .service-card:hover {
    opacity: 0.9;
  }
  .service-link {
    position: absolute;
    inset: 0;
  }
  .service-big {
    grid-column: span 2;
    grid-row: span 2;
    /* padding: 26px; */
  }
  .service-wide {
    grid-column: span 2;
    min-width: 0;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }
  .service-wide .service-title {
    min-width: 0;
  }
  .service-wide.service-long {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 6px;
  }
  .service-full {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }
  .service-full .service-title {
    font-stretch: 125%;
    font-size: clamp(32px, 4.4vw, 56px);
    line-height: 0.9;
    text-align: right;
  }
  .service-outline {
    border: 3px solid var(--color-fg);
  }
  .service-id {
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
  }
  .service-title {
    margin: 0;
    font-weight: 900;
    font-stretch: 118%;
    font-size: 40px;
    line-height: 0.9;
    overflow-wrap: break-word;
  }
  .service-big .service-title {
    font-size: clamp(48px, 6.6vw, 96px);
    line-height: 0.85;
  }
  .service-wide .service-title {
    font-weight: 900;
    font-stretch: 125%;
    font-size: 56px;
    line-height: 0.85;
  }
  .service-long .service-title {
    font-stretch: 100%;
    font-size: 32px;
    line-height: 1.05;
  }
  .service-card:not(.service-wide).service-long .service-title {
    font-size: 24px;
    line-height: 1.15;
  }
  .service-text {
    margin: 0;
    font:
      400 13px/1.5 "Space Mono",
      monospace;
    max-width: 340px;
  }

  /* agenda */
  .agenda {
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 60px 40px;
    border-bottom: 4px solid var(--color-bg);
    overflow-x: clip;
  }
  .agenda-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    padding: 0 8px 28px;
  }
  .agenda-title {
    margin: 0;
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(38px, 5.2vw, 76px);
    line-height: 0.85;
    letter-spacing: -0.03em;
  }
  .agenda-cta {
    font:
      700 12px/1.5 "Space Mono",
      monospace;
    letter-spacing: 0.12em;
    text-align: right;
    color: inherit;
    text-decoration: none;
  }
  .agenda-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: aq-left linear both;
    animation-timeline: view();
    animation-range: cover 0px cover 260px;
  }
  .agenda-row {
    display: grid;
    grid-template-columns: minmax(0, 110px) minmax(0, 1fr) minmax(0, 180px) minmax(
        0,
        150px
      );
    gap: 20px;
    align-items: center;
    padding: 18px 22px;
  }
  .agenda-date {
    font:
      700 30px/1 "Archivo",
      sans-serif;
  }
  .agenda-name {
    margin: 0;
    font-weight: 900;
    font-stretch: 110%;
    font-size: clamp(20px, 2.4vw, 34px);
    line-height: 1;
  }
  .agenda-meta {
    margin: 0;
    font:
      400 12px/1.4 "Space Mono",
      monospace;
  }
  .agenda-type {
    justify-self: end;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.75;
    white-space: nowrap;
  }
  .agenda-empty {
    padding: 32px 22px;
    text-align: center;
    font:
      400 14px/1.6 "Space Mono",
      monospace;
    opacity: 0.85;
  }

  /* skeleton loaders */
  .skel {
    background: linear-gradient(
      90deg,
      rgba(11, 11, 11, 0.14) 25%,
      rgba(11, 11, 11, 0.05) 37%,
      rgba(11, 11, 11, 0.14) 63%
    );
    background-size: 400% 100%;
    border-radius: 4px;
    animation: skel-shimmer 1.4s ease infinite;
  }
  .skel-row {
    background: rgba(11, 11, 11, 0.06);
  }
  .skel-date {
    height: 26px;
    width: 70px;
  }
  .skel-name {
    height: 20px;
    width: 60%;
  }
  .skel-meta {
    height: 14px;
    width: 80%;
  }
  .skel-type {
    height: 14px;
    width: 60px;
    justify-self: end;
  }
  .skel-card {
    background: #141414;
    cursor: default;
  }
  .skel-photo {
    height: 280px;
  }
  .skel-talent-name {
    height: 26px;
    width: 55%;
  }
  @keyframes skel-shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .skel {
      animation: none;
    }
  }

  /* talent */
  .talent-more {
    display: inline-block;
    margin: 28px 0 0 8px;
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
    color: var(--color-bg);
    text-decoration: none;
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: 3px;
  }
  .talent-more:hover {
    color: var(--color-primary);
  }

  /* talent */
  .talent {
    background: var(--color-fg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-bg);
    overflow-x: clip;
  }
  .talent-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    animation: aq-right linear both;
    animation-timeline: view();
    animation-range: cover 0px cover 260px;
  }
  .talent-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .talent-card.bg-cream {
    border: 1px solid var(--color-bg);
  }
  .talent-photo {
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
  .talent-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .talent-photo figcaption {
    font:
      400 11px/1.4 "Space Mono",
      monospace;
    text-align: center;
    letter-spacing: 0.08em;
  }
  .bg-dark .talent-photo {
    background: repeating-linear-gradient(
      45deg,
      #242424 0 12px,
      #1c1c1c 12px 24px
    );
  }
  .bg-purple .talent-photo {
    background: repeating-linear-gradient(
      45deg,
      rgba(20, 20, 20, 0.22) 0 12px,
      rgba(20, 20, 20, 0.08) 12px 24px
    );
  }
  .talent-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 0;
  }
  .talent-name {
    margin: 0;
    font-weight: 900;
    font-stretch: 110%;
    font-size: 30px;
  }

  /* crew */
  .crew {
    background: var(--color-bg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-fg);
  }
  .crew-kop {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin: 0 0 30px 8px;
  }
  .crew-title {
    margin: 0;
    max-width: 1080px;
    font-weight: 900;
    font-stretch: 115%;
    font-size: clamp(34px, 4.6vw, 64px);
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: var(--color-fg);
    text-wrap: balance;
  }
  .crew-nav {
    flex: none;
    display: flex;
    gap: 10px;
  }
  .crew-nav-knop {
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
  .crew-nav-knop svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: var(--color-bg);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .crew-nav-knop:hover:not(:disabled) {
    background: var(--color-fg);
  }
  .crew-nav-knop:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .crew-grid {
    list-style: none;
    margin: 0 -40px;
    padding: 0 40px 16px;
    display: flex;
    gap: 28px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 40px;
    scrollbar-width: none;
    animation: aq-pop linear both;
    animation-timeline: view();
    animation-range: cover 0px cover 260px;
  }
  .crew-grid::-webkit-scrollbar {
    display: none;
  }
  .crew-card {
    position: relative;
    flex: none;
    width: clamp(220px, 21vw, 290px);
    aspect-ratio: 5 / 7;
    overflow: hidden;
    scroll-snap-align: start;
    background: #1b1b1b;
    box-shadow: 10px 10px 0 var(--color-fg);
  }
  .crew-schaduw-purple {
    box-shadow: 10px 10px 0 var(--color-primary);
  }
  .crew-schaduw-orange {
    box-shadow: 10px 10px 0 var(--color-accent);
  }
  .crew-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .crew-geen-foto {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
    color: var(--color-muted);
    font:
      400 11px/1.4 "Space Mono",
      monospace;
  }
  .crew-meta {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 70px 14px 20px;
    background: linear-gradient(transparent, rgba(11, 11, 11, 0.92) 62%);
    color: var(--color-fg);
    text-align: center;
  }
  .crew-name {
    margin: 0;
    font-weight: 900;
    font-stretch: 110%;
    font-size: clamp(19px, 1.6vw, 24px);
    line-height: 1.05;
  }
  .crew-role {
    margin: 0;
    color: var(--color-accent);
    font:
      700 11px/1.2 "Space Mono",
      monospace;
    letter-spacing: 0.06em;
  }
  .crew-intro {
    display: flex;
    flex-direction: column;
    padding: 22px;
    background: var(--color-primary);
    color: var(--color-fg);
  }
  .crew-intro p {
    margin: 0;
  }
  .crew-intro-getal {
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(72px, 7vw, 104px);
    line-height: 0.85;
    letter-spacing: -0.04em;
  }
  .crew-intro-kop {
    margin-top: 8px !important;
    font-weight: 900;
    font-stretch: 110%;
    font-size: 20px;
  }
  .crew-intro-tekst {
    margin-top: auto !important;
    font:
      400 12px/1.6 "Space Mono",
      monospace;
  }
  .crew-bottom {
    margin-top: 16px;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 16px;
    align-items: stretch;
  }
  .crew-quote {
    margin: 0;
    background: var(--color-fg);
    color: var(--color-bg);
    padding: 34px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    box-shadow: 12px 12px 0 var(--color-primary);
  }
  .quote-label {
    margin: 0;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.16em;
    color: var(--color-primary);
  }
  .quote-text {
    margin: 0;
    font:
      700 32px/1.15 "Archivo",
      sans-serif;
    text-wrap: pretty;
  }
  .quote-attr {
    font:
      400 13px/1.5 "Space Mono",
      monospace;
    color: #5a5a5a;
  }
  .quote-attr cite {
    font-style: normal;
  }
  .crew-photo-large {
    min-height: 320px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(
      45deg,
      #1c1c1c 0 12px,
      #151515 12px 24px
    );
  }
  .crew-photo-large figcaption {
    text-align: center;
    color: #6b6b6b;
    font:
      400 12px/1.4 "Space Mono",
      monospace;
  }

  /* video */
  .video-section {
    background: var(--color-bg);
    padding: 64px 40px;
    border-bottom: 4px solid var(--color-fg);
    overflow-x: clip;
  }
  .video-title {
    margin: 0 0 14px 8px;
    max-width: 900px;
    font-weight: 900;
    font-stretch: 115%;
    font-size: clamp(34px, 4.6vw, 64px);
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: var(--color-fg);
    text-wrap: balance;
    animation: aq-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 32%;
  }
  .video-sub {
    margin: 0 0 36px 8px;
    color: var(--color-fg);
    font:
      400 16px/1.5 "Space Mono",
      monospace;
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
    animation: aq-skew linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
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
    font:
      400 14px/1.6 "Space Mono",
      monospace;
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
    animation: aq-skew linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
  .cta-form-label {
    margin: 0;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
    color: var(--color-accent);
  }
  .cta-field {
    width: 100%;
    box-sizing: border-box;
    background: #242424;
    border: none;
    padding: 14px;
    font:
      400 13px/1 "Space Mono",
      monospace;
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
    font:
      800 18px/1 "Archivo",
      sans-serif;
    border: none;
    cursor: pointer;
  }

  /* footer */
  .footer {
    background: var(--color-bg);
    color: var(--color-fg);
    padding: 56px 40px 34px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
    gap: clamp(16px, 3vw, 36px);
    font:
      400 12px/1.9 "Space Mono",
      monospace;
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
  .heading-orange {
    color: var(--color-accent);
  }
  .heading-lilac {
    color: var(--color-primary-light);
  }
  .heading-cream {
    color: var(--color-fg);
  }
  .footer-bottom {
    grid-column: 1 / -1;
    margin: 34px 0 0;
    padding-top: 16px;
    border-top: 2px solid #242424;
    display: flex;
    justify-content: space-between;
    font:
      700 11px/1 "Space Mono",
      monospace;
    letter-spacing: 0.14em;
    color: #7d7d7d;
  }

  /* tablet */
  @media (max-width: 860px) {
    .services-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .service-big {
      grid-column: span 2;
    }
    .service-wide:not(.service-big) {
      grid-column: span 1;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
    }
    .service-wide:not(.service-big) .service-title {
      font-size: clamp(22px, 8vw, 40px);
      font-stretch: 110%;
    }
    .agenda-row {
      grid-template-columns: minmax(0, 70px) minmax(0, 1fr);
      row-gap: 8px;
    }
    .talent-grid {
      grid-template-columns: 1fr;
    }
    .crew-bottom {
      grid-template-columns: 1fr;
    }
    .cta {
      grid-template-columns: 1fr;
    }
    .footer {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .footer-brand,
    .footer-tag {
      grid-column: 1 / -1;
    }
  }

  /* phone */
  @media (max-width: 640px) {
    .brand {
      padding: 14px 16px;
    }

    .hero {
      min-height: 320px;
    }
    .hero-copy {
      left: 20px;
      right: 20px;
      bottom: 28px;
      gap: 2px;
    }
    .hero-line {
      font-size: clamp(34px, 13vw, 64px);
    }

    .mission,
    .services,
    .agenda,
    .talent,
    .crew,
    .video-section,
    .cta,
    .footer {
      padding-left: 20px;
      padding-right: 20px;
    }

    .services-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: auto;
    }
    .crew-kop {
      flex-direction: column;
      align-items: flex-start;
      margin-left: 0;
    }
    .crew-grid {
      margin: 0 -20px;
      padding: 0 20px 16px;
      scroll-padding: 0 20px;
    }
    .crew-card {
      width: 68vw;
    }
    .service-big,
    .service-wide,
    .service-full {
      grid-column: span 1;
    }
    .service-full {
      flex-direction: column;
      align-items: flex-start;
    }
    .service-full .service-title {
      text-align: left;
    }

    .service-card {
      min-height: 130px;
      gap: 11px;
    }

    .agenda-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 16px 18px;
    }
    .agenda-type {
      justify-self: auto;
    }


    .footer {
      grid-template-columns: 1fr;
    }
    .footer-brand,
    .footer-tag,
    .footer-col {
      grid-column: 1;
    }
    .footer-brand {
      height: 48px;
    }
    .footer-bottom {
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
