<script>
  import dewiUitlegVideo from "$lib/assets/videos/dewi-uitleg.mp4";
  import pandFoto from "$lib/assets/pictures/pand/artquake-pand-voorkant.webp";

  const ruimtes = [
    "een creatieve huiskamer",
    "een oefenruimte voor muziek",
    "een zaal met podium, licht en geluid",
    "een atelier",
    "een opname-studio",
    "een dansstudio",
    "een fotostudio",
  ];

  let videoEl = $state();
  let videoMuted = $state(true);

  function toggleVideoMute() {
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    videoMuted = videoEl.muted;
  }

  $effect(() => {
    if (!videoEl) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(videoEl);
    return () => observer.disconnect();
  });
</script>

<div class="pand">
  <figure class="pand-media pand-video">
    <video
      bind:this={videoEl}
      class="pand-player"
      controls
      muted
      playsinline
      preload="metadata"
    >
      <source src={dewiUitlegVideo} type="video/mp4" />
      Je browser ondersteunt deze video niet.
    </video>
    <button
      type="button"
      class="pand-unmute"
      aria-pressed={!videoMuted}
      onclick={toggleVideoMute}
    >
      {videoMuted ? "GELUID AAN" : "DEMPEN"}
    </button>
  </figure>

  <figure class="pand-media pand-foto">
    <img src={pandFoto} alt="De voorkant van het Artquake-pand" loading="lazy" />
  </figure>

  <div class="pand-tekst">
    <p class="pand-lead">In het Artquake-pand vind je:</p>
    <ul class="pand-lijst">
      {#each ruimtes as r}
        <li>{r}</li>
      {/each}
    </ul>
    <p>
      Jonge artiesten/kunstenaars mogen gratis gebruik maken van deze ruimtes.
      Neem contact met Dewi op voor meer info.
    </p>
    <address class="pand-adres">
      <span class="pand-adres-label">ADRES</span>
      Sara de Bronovoland 7<br />
      Heerhugowaard
    </address>
  </div>
</div>

<style>
  .pand {
    display: grid;
    grid-template-columns: auto auto minmax(260px, 1fr);
    align-items: start;
    gap: 28px;
  }
  .pand-media {
    position: relative;
    margin: 0;
    height: min(75vh, 640px);
    aspect-ratio: 480 / 848;
    background: #000;
  }
  .pand-video {
    box-shadow: 14px 14px 0 var(--color-primary);
  }
  .pand-foto {
    box-shadow: 14px 14px 0 var(--color-accent);
  }
  .pand-player,
  .pand-foto img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pand-unmute {
    position: absolute;
    right: 12px;
    bottom: 56px;
    padding: 10px 16px;
    background: var(--color-bg);
    color: var(--color-fg);
    border: 2px solid var(--color-fg);
    border-radius: 20px;
    font:
      700 12px/1 "Space Mono",
      monospace;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  .pand-unmute:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .pand-tekst {
    color: var(--color-fg);
    font:
      400 15px/1.6 "Space Mono",
      monospace;
  }
  .pand-tekst p {
    margin: 0 0 18px;
  }
  .pand-lead {
    font-weight: 700;
  }
  .pand-lijst {
    margin: 0 0 24px;
    padding: 0;
    list-style: none;
  }
  .pand-lijst li {
    padding: 6px 0;
    border-bottom: 1px solid var(--color-border);
  }
  .pand-lijst li::before {
    content: "— ";
    color: var(--color-accent);
  }
  .pand-adres {
    display: inline-block;
    padding: 16px 20px;
    border: 3px solid var(--color-fg);
    font-style: normal;
    font-weight: 700;
  }
  .pand-adres-label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-accent);
    font-size: 12px;
    letter-spacing: 0.14em;
  }

  @media (max-width: 1100px) {
    .pand {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .pand-media {
      height: auto;
      width: 100%;
    }
    .pand-tekst {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .pand {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    .pand-media {
      width: calc(100% - 14px);
    }
  }
</style>
