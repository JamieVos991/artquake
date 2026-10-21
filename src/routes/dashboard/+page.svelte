<script>
  import { onMount, onDestroy } from "svelte";
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    serverTimestamp,
  } from "firebase/firestore";
  import { onAuthStateChanged } from "firebase/auth";
  import { db, auth } from "$lib/firebase.js";
  import { markeerCrewBrowser } from "$lib/crew.js";
  import { uploadFoto } from "$lib/fotoUpload.js";
  import { stuurReserveringMail, studioNamen } from "$lib/reserveringMail.js";
  import { artiestFotoPositie } from "$lib/data/fotoPosities.js";
  import { agendaFotoUitsneden, agendaFotoPositie } from "$lib/data/agendaFoto.js";
  import { agendaKleur, standaardAgendaKleur } from "$lib/data/agendaKleur.js";
  let authGecontroleerd = $state(false);
  let ingelogdeGebruiker = $state(null);
  // uitloggen gaat via het menu

  // matcht het bestaande schema van de 'agenda'-collectie (band, place, date,
  // startTime, endTime, type, imageUrl) zodat het compatibel blijft met de
  // reeds aanwezige data uit het oude admin-systeem.
  const typeSuggesties = [
    "Open entree",
    "Optreden",
    "Expositie",
    "Workshop",
    "Besloten",
  ];
  // oranje = automatisch: de website kiest dan een kleur op basis van het type
  const standaardKleur = standaardAgendaKleur;

  let band = $state("");
  let place = $state("");
  let type = $state("");
  let kleur = $state(standaardKleur);
  let date = $state("");
  let startTime = $state("");
  let endTime = $state("");
  let prijs = $state("");
  let imageUrl = $state("");
  let fotoUitsnede = $state("");
  let beschrijving = $state("");
  let submitting = $state(false);
  let error = $state("");
  let success = $state(false);

  let agendaItems = $state([]);
  let agendaGeladen = $state(false);
  let reserveringen = $state([]);
  let reserveringenGeladen = $state(false);
  let unsubscribeAgenda;
  let unsubscribeReserveringen;
  let unsubscribeArtiesten;

  function studioLabel(id) {
    return studios.find((s) => s.id === id)?.label ?? id ?? "–";
  }

  function formatDatum(iso) {
    if (!iso) return "–";
    const [j, m, d] = iso.split("-");
    return `${d}-${m}-${j}`;
  }

  function reserveringIsAfgelopen(r) {
    if (!r.datum || !r.eindtijd) return false;
    return new Date(`${r.datum}T${r.eindtijd}`) < new Date();
  }

  function isDezeWeek(datumStr) {
    if (!datumStr) return false;
    const datum = new Date(`${datumStr}T00:00:00`);
    const nu = new Date();
    const dag = (nu.getDay() + 6) % 7; // maandag = 0
    const maandag = new Date(nu);
    maandag.setHours(0, 0, 0, 0);
    maandag.setDate(nu.getDate() - dag);
    const zondag = new Date(maandag);
    zondag.setDate(maandag.getDate() + 6);
    zondag.setHours(23, 59, 59, 999);
    return datum >= maandag && datum <= zondag;
  }

  let verwijderBezig = $state(null);

  async function verwijderReservering(r) {
    const naam = r.naam || "deze reservering";
    const metMail = r.email ? `\n\n${r.email} krijgt een mail dat de reservering is verwijderd.` : "";
    if (
      !confirm(
        `Reservering van ${naam} (${formatDatum(r.datum)}, ${r.starttijd}–${r.eindtijd}) verwijderen?${metMail}`
      )
    )
      return;
    verwijderBezig = r.id;
    try {
      await deleteDoc(doc(db, "reserveringen", r.id));
      if (reserveringBewerkId === r.id) leegReserveringFormulier();
      if (r.email && !(await stuurReserveringMail(r, "verwijderd"))) {
        alert(`De reservering is verwijderd, maar de mail naar ${r.email} kon niet worden verstuurd.`);
      }
    } catch (err) {
      alert("Verwijderen mislukt. Probeer het opnieuw.");
    } finally {
      verwijderBezig = null;
    }
  }

  // ── reservering bewerken ──
  // zelfde tijden als het boekingsformulier: elk half uur van 09:00 tot 21:00
  const reserveringTijden = Array.from({ length: 25 }, (_, i) => {
    const m = 9 * 60 + i * 30;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });

  let reserveringBewerkId = $state(null);
  let rStudio = $state("");
  let rNaam = $state("");
  let rEmail = $state("");
  let rDatum = $state("");
  let rStart = $state("");
  let rEind = $state("");
  let reserveringOpslaan = $state(false);
  let reserveringFout = $state("");
  let reserveringGelukt = $state("");

  function leegReserveringFormulier() {
    reserveringBewerkId = null;
    rStudio = rNaam = rEmail = rDatum = rStart = rEind = "";
  }

  function bewerkReservering(r) {
    reserveringBewerkId = r.id;
    rStudio = r.studio ?? "";
    rNaam = r.naam ?? "";
    rEmail = r.email ?? "";
    rDatum = r.datum ?? "";
    rStart = r.starttijd ?? "";
    rEind = r.eindtijd ?? "";
    reserveringFout = "";
    reserveringGelukt = "";
    // het formulier verschijnt pas na deze klik, dus even wachten
    setTimeout(() =>
      document
        .getElementById("reservering-formulier")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  function annuleerReserveringBewerken() {
    leegReserveringFormulier();
    reserveringFout = "";
    reserveringGelukt = "";
  }

  async function slaReserveringOp(e) {
    e.preventDefault();
    reserveringFout = "";
    reserveringGelukt = "";
    if (rEind <= rStart) {
      reserveringFout = "De eindtijd moet na de begintijd liggen.";
      return;
    }
    const overlap = reserveringen.find(
      (r) =>
        r.id !== reserveringBewerkId &&
        r.studio === rStudio &&
        r.datum === rDatum &&
        rStart < r.eindtijd &&
        rEind > r.starttijd
    );
    if (overlap) {
      reserveringFout = `Deze ruimte is dan al gereserveerd door ${overlap.naam ?? "iemand anders"} (${overlap.starttijd}–${overlap.eindtijd}).`;
      return;
    }
    reserveringOpslaan = true;
    const velden = {
      studio: rStudio,
      naam: rNaam.trim(),
      email: rEmail.trim(),
      datum: rDatum,
      starttijd: rStart,
      eindtijd: rEind,
    };
    try {
      await updateDoc(doc(db, "reserveringen", reserveringBewerkId), {
        ...velden,
        gewijzigdOp: serverTimestamp(),
      });
      const gemaild = await stuurReserveringMail(velden, "gewijzigd");
      reserveringGelukt = gemaild
        ? `Opgeslagen ✓ ${velden.email} heeft een mail met de nieuwe gegevens gekregen.`
        : "Opgeslagen ✓ De mail kon niet worden verstuurd.";
      leegReserveringFormulier();
    } catch (err) {
      reserveringFout = "Opslaan mislukt. Probeer het opnieuw.";
    } finally {
      reserveringOpslaan = false;
    }
  }

  async function verwijderAgendaItem(a) {
    if (!confirm(`"${a.band ?? "Dit agenda-item"}" op ${formatDatum(a.date)} verwijderen?`))
      return;
    verwijderBezig = a.id;
    try {
      await deleteDoc(doc(db, "agenda", a.id));
      // wie dit item aan het bewerken was, krijgt weer een leeg formulier
      if (bewerkId === a.id) leegFormulier();
    } catch (err) {
      alert("Verwijderen mislukt. Probeer het opnieuw.");
    } finally {
      verwijderBezig = null;
    }
  }

  function startDataSubscripties() {
    unsubscribeArtiesten = onSnapshot(
      collection(db, "artiesten"),
      (snapshot) => {
        artiesten = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.naam ?? "").localeCompare(b.naam ?? ""));
        artiestenGeladen = true;
      },
      () => {
        artiestenGeladen = true;
      }
    );
    unsubscribeAgenda = onSnapshot(
      collection(db, "agenda"),
      (snapshot) => {
        agendaItems = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            `${a.date ?? ""}${a.startTime ?? ""}`.localeCompare(
              `${b.date ?? ""}${b.startTime ?? ""}`
            )
          );
        agendaGeladen = true;
      },
      () => {
        agendaGeladen = true;
      }
    );

    unsubscribeReserveringen = onSnapshot(
      collection(db, "reserveringen"),
      (snapshot) => {
        reserveringen = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            `${b.datum ?? ""}${b.starttijd ?? ""}`.localeCompare(
              `${a.datum ?? ""}${a.starttijd ?? ""}`
            )
          );
        reserveringenGeladen = true;
      },
      () => {
        reserveringenGeladen = true;
      }
    );
  }

  function stopDataSubscripties() {
    unsubscribeAgenda?.();
    unsubscribeReserveringen?.();
    unsubscribeArtiesten?.();
    artiesten = [];
    artiestenGeladen = false;
    agendaItems = [];
    reserveringen = [];
    agendaGeladen = false;
    reserveringenGeladen = false;
  }

  let unsubscribeAuth;

  onMount(() => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      ingelogdeGebruiker = user;
      authGecontroleerd = true;
      stopDataSubscripties();
      if (user) {
        markeerCrewBrowser(true);
        startDataSubscripties();
      } else {
        goto(`${base}/login`);
      }
    });
  });

  onDestroy(() => {
    unsubscribeAuth?.();
    stopDataSubscripties();
  });

  // id van het agenda-item dat in het formulier wordt bewerkt (null = nieuw)
  let bewerkId = $state(null);
  let succesTekst = $state("");

  function leegFormulier() {
    bewerkId = null;
    band = "";
    place = "";
    type = "";
    kleur = standaardKleur;
    date = "";
    startTime = "";
    endTime = "";
    prijs = "";
    imageUrl = "";
    fotoUitsnede = "";
    beschrijving = "";
  }

  function bewerkAgendaItem(a) {
    bewerkId = a.id;
    band = a.band ?? "";
    place = a.place ?? "";
    type = a.type ?? "";
    kleur = a.kleur || standaardKleur;
    date = a.date ?? "";
    startTime = a.startTime ?? "";
    endTime = a.endTime ?? "";
    prijs = a.prijs ?? "";
    imageUrl = a.imageUrl ?? "";
    fotoUitsnede = a.fotoUitsnede ?? "";
    beschrijving = a.beschrijving ?? "";
    error = "";
    success = false;
    document
      .getElementById("agenda-formulier")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function annuleerBewerken() {
    leegFormulier();
    error = "";
    success = false;
  }

  // ── foto uploaden naar Firebase Storage ──
  let uploadVoortgang = $state(null); // null = geen upload bezig, anders 0–100
  let uploadFout = $state("");

  // ── artiesten ──
  const artiestTypes = ["Podium", "Expo"];
  // uitsnede van de artiestfoto op de website (object-position)
  const artiestUitsneden = [
    { waarde: "50% 20%", label: "Boven" },
    { waarde: "50% 50%", label: "Midden" },
    { waarde: "50% 80%", label: "Onder" },
  ];

  let artiesten = $state([]);
  let artiestenGeladen = $state(false);
  let artiestZoek = $state("");
  let aantalPodium = $derived(artiesten.filter((a) => a.type === "Podium").length);
  let gefilterdeArtiesten = $derived(
    artiesten.filter((a) =>
      (a.naam ?? "").toLowerCase().includes(artiestZoek.trim().toLowerCase())
    )
  );

  let artiestBewerkId = $state(null);
  let aNaam = $state("");
  let aType = $state("Podium");
  let aBeschrijving = $state("");
  let aInstagram = $state("");
  let aImageUrl = $state("");
  let aFotoPositie = $state("");
  let artiestOpslaan = $state(false);
  let artiestFout = $state("");
  let artiestGelukt = $state("");
  let artiestUploadVoortgang = $state(null);

  function leegArtiestFormulier() {
    artiestBewerkId = null;
    aNaam = "";
    aType = "Podium";
    aBeschrijving = "";
    aInstagram = "";
    aImageUrl = "";
    aFotoPositie = "";
  }

  function bewerkArtiest(a) {
    artiestBewerkId = a.id;
    aNaam = a.naam ?? "";
    aType = a.type || "Podium";
    aBeschrijving = a.beschrijving ?? "";
    aInstagram = a.instagram ?? "";
    aImageUrl = a.imageUrl ?? "";
    aFotoPositie = a.fotoPositie ?? "";
    artiestFout = "";
    artiestGelukt = "";
    document
      .getElementById("artiest-formulier")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function annuleerArtiest() {
    leegArtiestFormulier();
    artiestFout = "";
    artiestGelukt = "";
  }

  async function kiesArtiestFoto(e) {
    const bestand = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!bestand) return;
    artiestFout = "";
    try {
      aImageUrl = await uploadFoto(bestand, "artiesten-images", (p) => (artiestUploadVoortgang = p));
    } catch (err) {
      artiestFout = err.message;
    } finally {
      artiestUploadVoortgang = null;
    }
  }

  async function slaArtiestOp(e) {
    e.preventDefault();
    artiestFout = "";
    artiestGelukt = "";
    artiestOpslaan = true;
    const velden = {
      naam: aNaam.trim(),
      type: aType,
      beschrijving: aBeschrijving.trim(),
      instagram: aInstagram.trim(),
      imageUrl: aImageUrl,
      fotoPositie: aFotoPositie,
    };
    try {
      if (artiestBewerkId) {
        await updateDoc(doc(db, "artiesten", artiestBewerkId), velden);
        artiestGelukt = `${velden.naam} opgeslagen ✓`;
      } else {
        await addDoc(collection(db, "artiesten"), velden);
        artiestGelukt = `${velden.naam} toegevoegd ✓`;
      }
      leegArtiestFormulier();
    } catch (err) {
      artiestFout = "Opslaan mislukt. Probeer het opnieuw.";
    } finally {
      artiestOpslaan = false;
    }
  }

  async function verwijderArtiest(a) {
    if (!confirm(`${a.naam ?? "Deze artiest"} van de website verwijderen?`)) return;
    verwijderBezig = a.id;
    try {
      await deleteDoc(doc(db, "artiesten", a.id));
      if (artiestBewerkId === a.id) leegArtiestFormulier();
    } catch (err) {
      alert("Verwijderen mislukt. Probeer het opnieuw.");
    } finally {
      verwijderBezig = null;
    }
  }

  async function kiesAgendaFoto(e) {
    const bestand = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!bestand) return;
    uploadFout = "";
    try {
      imageUrl = await uploadFoto(bestand, "agenda-images", (p) => (uploadVoortgang = p));
    } catch (err) {
      uploadFout = err.message;
    } finally {
      uploadVoortgang = null;
    }
  }

  async function addAgendaItem(e) {
    e.preventDefault();
    error = "";
    success = false;
    submitting = true;
    const velden = {
      band,
      place,
      type,
      kleur,
      date,
      startTime,
      endTime,
      prijs,
      imageUrl,
      fotoUitsnede,
      beschrijving,
    };
    try {
      if (bewerkId) {
        await updateDoc(doc(db, "agenda", bewerkId), {
          ...velden,
          gewijzigdOp: serverTimestamp(),
        });
        succesTekst = "Agenda-item opgeslagen ✓";
      } else {
        await addDoc(collection(db, "agenda"), {
          ...velden,
          createdAt: serverTimestamp(),
        });
        succesTekst = "Agenda-item toegevoegd ✓";
      }
      leegFormulier();
      success = true;
    } catch (err) {
      error = "Opslaan mislukt. Probeer het opnieuw.";
    } finally {
      submitting = false;
    }
  }

  const studios = [
    { id: "oefen", label: "OEFENRUIMTE", bg: "orange" },
    { id: "opname", label: "OPNAMESTUDIO", bg: "dark" },
    { id: "dans", label: "DANSSTUDIO", bg: "dark" },
    { id: "atelier", label: "ATELIER", bg: "purple" },
  ];

  function vandaagAlsDatum() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  let dezeWeek = $derived(reserveringen.filter((r) => isDezeWeek(r.datum)));
  let dezeWeekGeweest = $derived(dezeWeek.filter(reserveringIsAfgelopen).length);
  // eerst wat nog komt (vroegste bovenaan), daarna wat al geweest is
  let reserveringenOpVolgorde = $derived([
    ...reserveringen.filter((r) => !reserveringIsAfgelopen(r)).reverse(),
    ...reserveringen.filter(reserveringIsAfgelopen),
  ]);
  let reserveringZoek = $state("");
  let gezochteReserveringen = $derived(
    reserveringenOpVolgorde.filter((r) =>
      (r.naam ?? "").toLowerCase().includes(reserveringZoek.trim().toLowerCase())
    )
  );
  let komendeReserveringen = $derived(
    reserveringen.filter((r) => !reserveringIsAfgelopen(r)).length
  );
  let komendeAgenda = $derived(
    agendaItems.filter((a) => a.date && a.date >= vandaagAlsDatum()).length
  );

  function initialen(naam) {
    return (naam ?? "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
</script>

<svelte:head>
  <title>Dashboard | Artquake Admin</title>
  <meta name="robots" content="noindex" />
</svelte:head>

{#if !authGecontroleerd}
  <div class="auth-gate">
    <p>Bezig met controleren…</p>
  </div>
{:else if !ingelogdeGebruiker}
  <div class="auth-gate">
    <p>Je wordt doorgestuurd naar de inlogpagina…</p>
  </div>
{:else}
  <div class="db">
    <main class="db-paneel" id="overzicht">
      <div class="db-kop">
        <h1>Overzicht</h1>
      </div>

      <!-- kaarten: reserveringen (deze week en altijd), artiesten en agenda -->
      <section class="db-kaarten" aria-label="Statistieken">
        <article class="db-kaart db-kaart-oranje">
          <span class="db-label db-label-donker">Deze week</span>
          <h2>{dezeWeek.length} {dezeWeek.length === 1 ? "reservering" : "reserveringen"}</h2>
          <div class="db-voortgang">
            <p><span>Al geweest</span><span>{dezeWeekGeweest}/{dezeWeek.length}</span></p>
            <div class="db-balk"><i style:width="{dezeWeek.length ? (dezeWeekGeweest / dezeWeek.length) * 100 : 0}%"></i></div>
          </div>
        </article>

        <article class="db-kaart db-kaart-donker">
          <span class="db-label db-label-oranje">Altijd</span>
          <h2>{reserveringen.length} {reserveringen.length === 1 ? "reservering" : "reserveringen"} in totaal</h2>
          <div class="db-voortgang">
            <p><span>Nog te komen</span><span>{komendeReserveringen}/{reserveringen.length}</span></p>
            <div class="db-balk"><i style:width="{reserveringen.length ? (komendeReserveringen / reserveringen.length) * 100 : 0}%"></i></div>
          </div>
        </article>

        <article class="db-kaart db-kaart-paars">
          <span class="db-label db-label-donker">Artiesten</span>
          <h2>{artiesten.length} {artiesten.length === 1 ? "artiest" : "artiesten"} op de website</h2>
          <div class="db-voortgang">
            <p><span>Podium · Expo</span><span>{aantalPodium} · {artiesten.length - aantalPodium}</span></p>
            <div class="db-balk"><i style:width="{artiesten.length ? (aantalPodium / artiesten.length) * 100 : 0}%"></i></div>
          </div>
        </article>

        <article class="db-kaart db-kaart-licht">
          <span class="db-label db-label-donker">Agenda</span>
          <h2>{komendeAgenda} {komendeAgenda === 1 ? "activiteit" : "activiteiten"} op komst</h2>
        </article>
      </section>

      <!-- reserveringen -->
      <div class="db-rij" class:db-rij-enkel={!reserveringBewerkId} class:db-rij-agenda={reserveringBewerkId}>
        <section class="db-blok" id="reserveringen">
          <header class="db-blok-kop">
            <h2>Reserveringen</h2>
            <span class="db-blok-info">{komendeReserveringen} nog te komen</span>
            <a class="db-verwijder db-top-knop" href="{base}/reserveren">Nieuwe reservering</a>
          </header>
          {#if !reserveringenGeladen}
            <p class="db-leeg">Laden…</p>
          {:else if reserveringen.length === 0}
            <p class="db-leeg">Nog geen reserveringen binnengekomen.</p>
          {:else}
            {#if reserveringGelukt}
              <p class="db-gelukt db-melding">{reserveringGelukt}</p>
            {/if}
            <input
              class="db-zoek"
              type="search"
              placeholder="zoek op naam"
              aria-label="Zoek een reservering op naam"
              bind:value={reserveringZoek}
            />
            {#if gezochteReserveringen.length === 0}
              <p class="db-leeg">Geen reserveringen gevonden voor "{reserveringZoek.trim()}".</p>
            {:else}
            <div class="db-lijst-kop" aria-hidden="true">
              <span>Wie en waar</span><span>Datum</span><span>Tijd</span><span></span><span></span>
            </div>
            <ul class="db-lijst">
              {#each gezochteReserveringen as r (r.id)}
                {@const geweest = reserveringIsAfgelopen(r)}
                <li class="db-regel" class:is-geweest={geweest} class:is-bewerkt={reserveringBewerkId === r.id}>
                  <span class="db-regel-wie">
                    <span class="db-avatar db-avatar-klein">{initialen(r.naam)}</span>
                    <span>
                      <strong>{r.naam ?? "–"}</strong>
                      <span>{studioLabel(r.studio)}{geweest ? " · afgelopen" : ""}</span>
                    </span>
                  </span>
                  <span class="db-regel-datum">{formatDatum(r.datum)}</span>
                  <span class="db-regel-tijd"
                    >{r.starttijd ?? "–"}{r.eindtijd ? `–${r.eindtijd}` : ""}</span
                  >
                  <button
                    type="button"
                    class="db-verwijder db-bewerk"
                    onclick={() => bewerkReservering(r)}
                    aria-label="Reservering van {r.naam ?? 'onbekend'} bewerken"
                  >
                    Bewerk
                  </button>
                  <button
                    type="button"
                    class="db-verwijder"
                    disabled={verwijderBezig === r.id}
                    onclick={() => verwijderReservering(r)}
                    aria-label="Reservering van {r.naam ?? 'onbekend'} verwijderen"
                  >
                    {verwijderBezig === r.id ? "…" : "Verwijder"}
                  </button>
                </li>
              {/each}
            </ul>
            {/if}
          {/if}
        </section>

        {#if reserveringBewerkId}
          <section class="db-blok db-formulier-blok" id="reservering-formulier">
            <header class="db-blok-kop">
              <h2>Reservering bewerken</h2>
            </header>
            <form class="db-formulier" onsubmit={slaReserveringOp}>
              <label class="db-veld">
                <span>Ruimte *</span>
                <select bind:value={rStudio} required>
                  {#each Object.entries(studioNamen) as [id, naam]}
                    <option value={id}>{naam}</option>
                  {/each}
                </select>
              </label>
              <label class="db-veld">
                <span>Naam *</span>
                <input type="text" bind:value={rNaam} required />
              </label>
              <label class="db-veld">
                <span>E-mail *</span>
                <input type="email" bind:value={rEmail} required />
              </label>
              <div class="db-veld-rij">
                <label class="db-veld">
                  <span>Datum *</span>
                  <input type="date" bind:value={rDatum} required />
                </label>
                <label class="db-veld">
                  <span>Begin *</span>
                  <select bind:value={rStart} required>
                    {#each reserveringTijden.slice(0, -1) as t}
                      <option value={t}>{t}</option>
                    {/each}
                  </select>
                </label>
                <label class="db-veld">
                  <span>Eind *</span>
                  <select bind:value={rEind} required>
                    {#each reserveringTijden.slice(1) as t}
                      <option value={t}>{t}</option>
                    {/each}
                  </select>
                </label>
              </div>
              <p class="db-hint">Na opslaan krijgt de huurder een mail met de nieuwe gegevens.</p>

              {#if reserveringFout}
                <p class="db-fout">{reserveringFout}</p>
              {/if}

              <button class="db-knop db-knop-breed" type="submit" disabled={reserveringOpslaan}>
                {reserveringOpslaan ? "Bezig…" : "Opslaan en mailen"}
              </button>
              <button
                class="db-verwijder db-annuleer"
                type="button"
                disabled={reserveringOpslaan}
                onclick={annuleerReserveringBewerken}
              >
                Annuleren
              </button>
            </form>
          </section>
        {/if}
      </div>

      <!-- agenda -->
      <div class="db-rij db-rij-agenda" id="agenda">
        <section class="db-blok">
          <header class="db-blok-kop">
            <h2>Agenda</h2>
            <span class="db-blok-info">{komendeAgenda} op komst</span>
          </header>
          {#if !agendaGeladen}
            <p class="db-leeg">Laden…</p>
          {:else if agendaItems.length === 0}
            <p class="db-leeg">Geen evenementen op komst.</p>
          {:else}
            <div class="db-lijst-kop db-lijst-kop-agenda" aria-hidden="true">
              <span>Wat en waar</span><span>Datum</span><span>Tijd</span><span></span><span></span>
            </div>
            <ul class="db-lijst">
              {#each agendaItems as a (a.id)}
                <li class="db-regel db-regel-agenda" class:is-bewerkt={bewerkId === a.id}>
                  <span class="db-regel-wie">
                    {#if a.imageUrl}
                      <img
                        class="db-avatar db-avatar-klein"
                        src={a.imageUrl}
                        alt=""
                        style:object-position={agendaFotoPositie(a)}
                      />
                    {:else}
                      <span class="db-avatar db-avatar-klein" style:background={agendaKleur(a)}></span>
                    {/if}
                    <span>
                      <strong>{a.band ?? "–"}</strong>
                      <span>{a.place ?? "–"}{a.type ? ` · ${a.type}` : ""}</span>
                    </span>
                  </span>
                  <span class="db-regel-datum">{formatDatum(a.date)}</span>
                  <span class="db-regel-tijd"
                    >{a.startTime ?? "–"}{a.endTime ? `–${a.endTime}` : ""}</span
                  >
                  <button
                    type="button"
                    class="db-verwijder db-bewerk"
                    onclick={() => bewerkAgendaItem(a)}
                    aria-label="{a.band ?? 'Agenda-item'} bewerken"
                  >
                    Bewerk
                  </button>
                  <button
                    type="button"
                    class="db-verwijder"
                    disabled={verwijderBezig === a.id}
                    onclick={() => verwijderAgendaItem(a)}
                    aria-label="{a.band ?? 'Agenda-item'} verwijderen"
                  >
                    {verwijderBezig === a.id ? "…" : "Verwijder"}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <section class="db-blok db-formulier-blok" id="agenda-formulier">
          <header class="db-blok-kop">
            <h2>{bewerkId ? "Agenda-item bewerken" : "Agenda-item toevoegen"}</h2>
          </header>
          <form class="db-formulier" onsubmit={addAgendaItem}>
            <label class="db-veld">
              <span>Naam *</span>
              <input type="text" placeholder="bijv. The Wombats" bind:value={band} required />
            </label>
            <label class="db-veld">
              <span>Locatie</span>
              <input type="text" placeholder="bijv. Artquake, Heerhugowaard" bind:value={place} />
            </label>
            <div class="db-veld-rij">
              <label class="db-veld">
                <span>Datum *</span>
                <input type="date" bind:value={date} required />
              </label>
              <label class="db-veld">
                <span>Start</span>
                <input type="time" bind:value={startTime} />
              </label>
              <label class="db-veld">
                <span>Eind</span>
                <input type="time" bind:value={endTime} />
              </label>
            </div>
            <div class="db-veld-rij db-veld-rij-type">
              <label class="db-veld">
                <span>Type</span>
                <input type="text" list="type-suggesties" placeholder="bijv. Open entree" bind:value={type} />
                <datalist id="type-suggesties">
                  {#each typeSuggesties as t}
                    <option value={t}></option>
                  {/each}
                </datalist>
              </label>
              <label class="db-veld db-veld-kleur">
                <span title="Laat je hem oranje, dan kiest de website een kleur bij het type">Kleur</span>
                <input
                  type="color"
                  bind:value={kleur}
                  title="Oranje = automatisch, op basis van het type"
                />
              </label>
            </div>
            <label class="db-veld">
              <span>Prijs</span>
              <input type="text" list="prijs-suggesties" placeholder="bijv. Gratis of € 5,-" bind:value={prijs} />
              <datalist id="prijs-suggesties">
                <option value="Gratis"></option>
              </datalist>
            </label>
            <div class="db-veld">
              <span>Foto</span>
              <div class="db-foto-upload">
                {#if imageUrl}
                  <img class="db-foto-voorbeeld" src={imageUrl} alt="" />
                {/if}
                <label class="db-verwijder db-foto-kies" class:is-bezig={uploadVoortgang !== null}>
                  {#if uploadVoortgang !== null}
                    Uploaden… {uploadVoortgang}%
                  {:else}
                    {imageUrl ? "Andere foto kiezen" : "Foto kiezen"}
                  {/if}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadVoortgang !== null}
                    onchange={kiesAgendaFoto}
                  />
                </label>
                {#if imageUrl && uploadVoortgang === null}
                  <button type="button" class="db-verwijder" onclick={() => (imageUrl = "")}>
                    Foto weghalen
                  </button>
                {/if}
              </div>
              {#if uploadFout}
                <p class="db-fout">{uploadFout}</p>
              {/if}
            </div>
            {#if imageUrl}
              <div class="db-veld">
                <span>Welk deel van de foto?</span>
                <div class="db-uitsnede">
                  {#each agendaFotoUitsneden as u}
                    <label class="db-uitsnede-optie">
                      <input type="radio" name="fotoUitsnede" value={u.waarde} bind:group={fotoUitsnede} />
                      <img src={imageUrl} alt="" style:object-position={u.positie} />
                      <span>{u.label}</span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}
            <label class="db-veld">
              <span>Beschrijving</span>
              <textarea placeholder="korte omschrijving (optioneel)" rows="3" bind:value={beschrijving}></textarea>
            </label>

            {#if error}
              <p class="db-fout">{error}</p>
            {/if}
            {#if success}
              <p class="db-gelukt">{succesTekst}</p>
            {/if}

            <button class="db-knop db-knop-breed" type="submit" disabled={submitting || uploadVoortgang !== null}>
              {submitting ? "Bezig…" : bewerkId ? "Opslaan" : "Toevoegen"}
            </button>
            {#if bewerkId}
              <button
                class="db-verwijder db-annuleer"
                type="button"
                disabled={submitting}
                onclick={annuleerBewerken}
              >
                Annuleren
              </button>
            {/if}
          </form>
        </section>
      </div>

      <!-- artiesten -->
      <div class="db-rij db-rij-agenda" id="artiesten">
        <section class="db-blok">
          <header class="db-blok-kop">
            <h2>Artiesten</h2>
            <span class="db-blok-info">{artiesten.length} op de website</span>
          </header>
          <input
            class="db-zoek"
            type="search"
            placeholder="zoek een artiest"
            aria-label="Zoek een artiest"
            bind:value={artiestZoek}
          />
          {#if !artiestenGeladen}
            <p class="db-leeg">Laden…</p>
          {:else if gefilterdeArtiesten.length === 0}
            <p class="db-leeg">Geen artiesten gevonden.</p>
          {:else}
            <ul class="db-lijst">
              {#each gefilterdeArtiesten as a (a.id)}
                <li class="db-regel db-regel-artiest" class:is-bewerkt={artiestBewerkId === a.id}>
                  <span class="db-regel-wie">
                    {#if a.imageUrl}
                      <img
                        class="db-avatar db-avatar-klein"
                        src={a.imageUrl}
                        alt=""
                        loading="lazy"
                        style:object-position={artiestFotoPositie(a)}
                      />
                    {:else}
                      <span class="db-avatar db-avatar-klein">{initialen(a.naam)}</span>
                    {/if}
                    <span>
                      <strong>{a.naam ?? "–"}</strong>
                      <span>{[a.type, a.beschrijving].filter(Boolean).join(" · ")}</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    class="db-verwijder db-bewerk"
                    onclick={() => bewerkArtiest(a)}
                    aria-label="{a.naam ?? 'Artiest'} bewerken"
                  >
                    Bewerk
                  </button>
                  <button
                    type="button"
                    class="db-verwijder"
                    disabled={verwijderBezig === a.id}
                    onclick={() => verwijderArtiest(a)}
                    aria-label="{a.naam ?? 'Artiest'} verwijderen"
                  >
                    {verwijderBezig === a.id ? "…" : "Verwijder"}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <section class="db-blok db-formulier-blok" id="artiest-formulier">
          <header class="db-blok-kop">
            <h2>{artiestBewerkId ? "Artiest bewerken" : "Artiest toevoegen"}</h2>
          </header>
          <form class="db-formulier" onsubmit={slaArtiestOp}>
            <label class="db-veld">
              <span>Naam *</span>
              <input type="text" placeholder="bijv. Leech" bind:value={aNaam} required />
            </label>
            <div class="db-veld-rij db-veld-rij-artiest">
              <label class="db-veld">
                <span>Omschrijving</span>
                <input type="text" placeholder="bijv. Band of Singer-songwriter" bind:value={aBeschrijving} />
              </label>
              <label class="db-veld db-veld-type">
                <span>Type</span>
                <select bind:value={aType}>
                  {#each artiestTypes as t}
                    <option value={t}>{t}</option>
                  {/each}
                </select>
              </label>
            </div>
            <label class="db-veld">
              <span>Instagram</span>
              <input type="url" placeholder="https://www.instagram.com/… (optioneel)" bind:value={aInstagram} />
            </label>
            <div class="db-veld">
              <span>Foto</span>
              <div class="db-foto-upload">
                {#if aImageUrl}
                  <img class="db-foto-voorbeeld" src={aImageUrl} alt="" />
                {/if}
                <label class="db-verwijder db-foto-kies" class:is-bezig={artiestUploadVoortgang !== null}>
                  {#if artiestUploadVoortgang !== null}
                    Uploaden… {artiestUploadVoortgang}%
                  {:else}
                    {aImageUrl ? "Andere foto kiezen" : "Foto kiezen"}
                  {/if}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={artiestUploadVoortgang !== null}
                    onchange={kiesArtiestFoto}
                  />
                </label>
                {#if aImageUrl && artiestUploadVoortgang === null}
                  <button type="button" class="db-verwijder" onclick={() => (aImageUrl = "")}>
                    Foto weghalen
                  </button>
                {/if}
              </div>
            </div>
            {#if aImageUrl}
              <div class="db-veld">
                <span>Welk deel van de foto?</span>
                <div class="db-uitsnede">
                  {#each artiestUitsneden as u}
                    <label class="db-uitsnede-optie">
                      <input type="radio" name="artiestUitsnede" value={u.waarde} bind:group={aFotoPositie} />
                      <img class="db-uitsnede-artiest" src={aImageUrl} alt="" style:object-position={u.waarde} />
                      <span>{u.label}</span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}

            {#if artiestFout}
              <p class="db-fout">{artiestFout}</p>
            {/if}
            {#if artiestGelukt}
              <p class="db-gelukt">{artiestGelukt}</p>
            {/if}

            <button
              class="db-knop db-knop-breed"
              type="submit"
              disabled={artiestOpslaan || artiestUploadVoortgang !== null}
            >
              {artiestOpslaan ? "Bezig…" : artiestBewerkId ? "Opslaan" : "Toevoegen"}
            </button>
            {#if artiestBewerkId}
              <button
                class="db-verwijder db-annuleer"
                type="button"
                disabled={artiestOpslaan}
                onclick={annuleerArtiest}
              >
                Annuleren
              </button>
            {/if}
          </form>
        </section>
      </div>
    </main>
  </div>
{/if}

<style>
  /* Dashboard in de stijl van de homepage: donkere achtergrond, zware
     Archivo-koppen in hoofdletters, Space Mono-labels, effen merkkleuren
     en harde verschoven schaduwen (zoals de crewkaarten en het
     contactformulier). */

  .auth-gate {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    color: var(--color-muted);
    font: 700 12px/1.5 var(--font-mono);
    letter-spacing: 0.1em;
  }

  .db {
    --db-rand: var(--color-bg);
    --db-zacht: rgba(11, 11, 11, 0.65);
    --db-schaduw: 10px;
    min-height: 100vh;
    padding: 40px 40px 64px;
    background: var(--color-bg);
    font-family: var(--font-display);
    color: var(--color-fg);
  }

  /* paneel */
  .db-paneel {
    max-width: 1400px;
    margin: 0 auto;
    scroll-margin-top: 14px;
  }
  .db-avatar {
    flex: none;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 2px solid var(--color-bg);
    background: var(--color-accent);
    color: var(--color-bg);
    font-weight: 900;
    font-size: 13px;
    object-fit: cover;
  }
  .db-avatar-klein {
    width: 40px;
    height: 40px;
    font-size: 12px;
    background: var(--color-primary);
    color: var(--color-fg);
  }

  .db-kop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 32px;
    /* ruimte voor de menuknop rechtsboven */
    padding-right: 64px;
  }
  .db-kop h1 {
    margin: 0;
    font-weight: 900;
    font-stretch: 125%;
    font-size: clamp(44px, 6.4vw, 92px);
    line-height: 0.85;
    letter-spacing: -0.035em;
    text-transform: uppercase;
    color: var(--color-fg);
    text-shadow: 6px 6px 0 var(--color-primary);
  }

  /* gekleurde kaarten */
  .db-kaarten {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 28px;
    margin-bottom: 40px;
  }
  .db-kaart {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 22px;
  }
  .db-kaart-oranje {
    background: var(--color-accent);
    color: var(--color-bg);
    box-shadow: var(--db-schaduw) var(--db-schaduw) 0 var(--color-primary);
  }
  .db-kaart-paars {
    background: var(--color-primary);
    color: var(--color-fg);
    box-shadow: var(--db-schaduw) var(--db-schaduw) 0 var(--color-accent);
  }
  .db-kaart-licht {
    background: var(--color-fg);
    color: var(--color-bg);
    box-shadow: var(--db-schaduw) var(--db-schaduw) 0 var(--color-primary);
  }
  /* donkere kaart met crème rand, zoals de omlijnde blokken op de homepage */
  .db-kaart-donker {
    background: var(--color-bg);
    color: var(--color-fg);
    border: 3px solid var(--color-fg);
    box-shadow: var(--db-schaduw) var(--db-schaduw) 0 var(--color-accent);
  }
  .db-kaart h2 {
    margin: 0;
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(22px, 2vw, 30px);
    line-height: 0.95;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }
  .db-label {
    padding: 7px 10px;
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .db-label-donker {
    background: var(--color-bg);
    color: var(--color-fg);
  }
  .db-label-oranje {
    background: var(--color-accent);
    color: var(--color-bg);
  }
  .db-voortgang {
    align-self: stretch;
  }
  .db-voortgang p {
    display: flex;
    justify-content: space-between;
    margin: 0 0 8px;
    font: 700 11px/1.2 "Space Mono", monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.85;
  }
  .db-balk {
    height: 8px;
    background: color-mix(in srgb, currentColor 22%, transparent);
    overflow: hidden;
  }
  .db-balk i {
    display: block;
    height: 100%;
    background: currentColor;
    transition: width 0.4s ease;
  }
  .db-knop {
    align-self: flex-end;
    padding: 12px 20px;
    border: 0;
    background: var(--color-bg);
    color: var(--color-fg);
    font: 700 12px/1 "Space Mono", monospace;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .db-knop:hover:not(:disabled) {
    background: var(--color-fg);
    color: var(--color-bg);
  }
  .db-knop:disabled {
    opacity: 0.6;
    cursor: default;
  }
  /* de grote knop in een formulier, zoals VERSTUUR op de homepage */
  .db-knop-breed {
    align-self: stretch;
    padding: 16px 18px;
    text-align: center;
    background: var(--color-primary);
    color: var(--color-fg);
    font: 800 18px/1 "Archivo", sans-serif;
    letter-spacing: 0.02em;
  }
  .db-knop-breed:hover:not(:disabled) {
    background: var(--color-primary-dark);
    color: var(--color-fg);
  }

  /* blokken */
  .db-rij {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 28px;
    margin-bottom: 40px;
    scroll-margin-top: 14px;
  }
  .db-rij-agenda {
    grid-template-columns: minmax(0, 1.200fr) minmax(0, 1fr);
  }
  .db-rij-enkel {
    grid-template-columns: minmax(0, 1fr);
  }
  /* kleine knoppen bovenin en in de kop van een blok */
  .db-top-knop {
    justify-self: auto;
    text-decoration: none;
    white-space: nowrap;
  }
  .db-top-knop:hover:not(:disabled) {
    background: var(--color-bg);
    border-color: var(--color-bg);
    color: var(--color-fg);
  }
  .db-blok {
    min-width: 0;
    padding: 24px;
    background: var(--color-fg);
    color: var(--color-bg);
    box-shadow: var(--db-schaduw) var(--db-schaduw) 0 var(--color-primary);
    scroll-margin-top: 14px;
  }
  .db-formulier-blok {
    box-shadow: var(--db-schaduw) var(--db-schaduw) 0 var(--color-accent);
  }
  .db-blok-kop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px 14px;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 3px solid var(--color-bg);
  }
  .db-blok-kop h2 {
    margin: 0;
    font-weight: 900;
    font-stretch: 118%;
    font-size: clamp(26px, 2.4vw, 34px);
    line-height: 0.9;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }
  .db-blok-info {
    margin-right: auto;
    color: var(--color-primary);
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .db-leeg {
    margin: 0;
    padding: 18px 0;
    font: 400 13px/1.6 "Space Mono", monospace;
    color: var(--db-zacht);
  }

  .db-lijst-kop,
  .db-regel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 96px 110px 64px 84px;
    align-items: center;
    gap: 12px;
  }
  .db-lijst-kop-agenda,
  .db-regel-agenda {
    grid-template-columns: minmax(0, 1fr) 96px 110px 64px 84px;
  }
  .db-regel.is-bewerkt {
    background: var(--color-accent);
  }
  .db-regel-artiest {
    grid-template-columns: minmax(0, 1fr) 64px 84px;
  }
  .db-zoek {
    width: 100%;
    max-width: 280px;
    box-sizing: border-box;
    margin-bottom: 12px;
    padding: 11px 14px;
    border: 2px solid var(--color-bg);
    background: #fff;
    color: var(--color-bg);
    font: 400 13px/1.2 "Space Mono", monospace;
  }
  .db-zoek::placeholder {
    color: #8d8d8d;
  }
  .db-zoek:focus {
    outline: 3px solid var(--color-primary);
    outline-offset: 0;
  }
  /* artiestfoto's staan op de website bijna vierkant */
  .db-uitsnede-optie img.db-uitsnede-artiest {
    aspect-ratio: 1 / 1;
  }
  .db-bewerk:hover:not(:disabled) {
    background: var(--color-bg);
    border-color: var(--color-bg);
    color: var(--color-fg);
  }
  .db-foto-upload {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .db-foto-voorbeeld {
    width: 112px;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border: 2px solid var(--color-bg);
  }
  .db-foto-kies {
    position: relative;
    overflow: hidden;
  }
  .db-foto-kies:hover,
  .db-foto-kies:focus-within {
    background: var(--color-bg);
    border-color: var(--color-bg);
    color: var(--color-fg);
  }
  .db-foto-kies.is-bezig {
    cursor: progress;
    opacity: 0.7;
  }
  /* het echte bestandsveld ligt onzichtbaar over de knop */
  .db-foto-kies input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  .db-uitsnede {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .db-uitsnede-optie {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .db-uitsnede-optie input {
    position: absolute;
    opacity: 0;
  }
  .db-uitsnede-optie img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border: 3px solid transparent;
  }
  .db-uitsnede-optie input:checked + img {
    border-color: var(--color-primary);
  }
  .db-uitsnede-optie input:focus-visible + img {
    outline: 2px solid var(--color-bg);
    outline-offset: 2px;
  }
  .db-annuleer {
    align-self: center;
    padding: 10px 18px;
  }
  .db-annuleer:hover:not(:disabled) {
    background: var(--color-bg);
    border-color: var(--color-bg);
    color: var(--color-fg);
  }
  .db-lijst-kop {
    padding-bottom: 10px;
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--db-zacht);
  }
  .db-lijst {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 440px;
    overflow-y: auto;
  }
  .db-regel {
    padding: 12px 8px;
    border-top: 2px solid rgba(11, 11, 11, 0.16);
    font-size: 14px;
  }
  .db-regel.is-geweest {
    opacity: 0.45;
  }
  .db-regel-wie {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .db-regel-wie > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    font: 400 12px/1.3 "Space Mono", monospace;
    color: var(--db-zacht);
  }
  .db-regel-wie strong {
    color: var(--color-bg);
    font: 800 16px/1.1 "Archivo", sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .db-regel-datum,
  .db-regel-tijd {
    font: 700 13px/1.2 "Space Mono", monospace;
  }
  .db-verwijder {
    justify-self: end;
    padding: 8px 10px;
    border: 2px solid var(--color-bg);
    background: transparent;
    color: var(--color-bg);
    font: 700 11px/1 "Space Mono", monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .db-verwijder:hover:not(:disabled) {
    background: #c0392b;
    border-color: #c0392b;
    color: #fff;
  }

  /* formulier */
  .db-formulier {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .db-veld {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    color: var(--color-bg);
    font: 700 11px/1.2 "Space Mono", monospace;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .db-veld input,
  .db-veld select,
  .db-veld textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    border: 2px solid var(--color-bg);
    background: #fff;
    color: var(--color-bg);
    font: 400 14px/1.3 "Space Mono", monospace;
    letter-spacing: 0;
    text-transform: none;
  }
  .db-veld input::placeholder,
  .db-veld textarea::placeholder {
    color: #8d8d8d;
  }
  .db-veld input:focus,
  .db-veld select:focus,
  .db-veld textarea:focus {
    outline: 3px solid var(--color-primary);
    outline-offset: 0;
  }
  .db-veld textarea {
    resize: vertical;
  }
  .db-veld-rij {
    display: grid;
    grid-template-columns: 1.300fr 1fr 1fr;
    gap: 10px;
  }
  .db-veld-rij-type {
    grid-template-columns: 1fr 72px;
  }
  .db-veld-rij-artiest {
    grid-template-columns: 1fr 120px;
  }
  .db-veld-kleur input {
    height: 46px;
    padding: 4px;
  }
  .db-fout,
  .db-gelukt {
    margin: 0;
    font: 700 12px/1.5 "Space Mono", monospace;
  }
  .db-fout {
    color: #c0392b;
  }
  .db-melding {
    margin-bottom: 12px;
  }
  .db-hint {
    margin: 0;
    font: 400 12px/1.5 "Space Mono", monospace;
    color: var(--db-zacht);
  }
  .db-gelukt {
    color: #2f7d4f;
  }

  /* vier kaarten passen niet naast elkaar op een kleiner scherm */
  @media (max-width: 1200px) {
    .db-kaarten {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 1000px) {
    .db-rij,
    .db-rij-agenda {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .db-kaarten {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .db {
      --db-schaduw: 6px;
      padding: 20px 20px 48px;
    }
    .db-kaarten,
    .db-rij {
      gap: 22px;
      margin-bottom: 28px;
    }
    .db-blok {
      padding: 18px;
    }
    .db-lijst-kop {
      display: none;
    }
    .db-regel,
    .db-regel-agenda,
    .db-regel-artiest {
      grid-template-columns: minmax(0, 1fr) auto;
      row-gap: 6px;
    }
    .db-regel-wie {
      grid-column: 1 / -1;
    }
    .db-regel-datum {
      color: var(--db-zacht);
    }
    .db-verwijder {
      grid-column: 1 / -1;
      justify-self: start;
    }
    .db-veld-rij {
      grid-template-columns: 1fr 1fr;
    }
    .db-veld-rij > :first-child {
      grid-column: 1 / -1;
    }
    .db-veld-rij-type > :first-child {
      grid-column: auto;
    }
    .db-veld-rij-type {
      grid-template-columns: 1fr 72px;
    }
  }
</style>
