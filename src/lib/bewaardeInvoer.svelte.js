import { onMount } from "svelte";

// Bewaart wat iemand in een formulier of zoekveld typt in de browser (localStorage),
// zodat het na verversen nog staat. `lees` geeft de velden als object, `zet` vult ze
// weer in. Staat alles weer zoals bij het openen (leeg, of na opslaan/versturen),
// dan wordt de bewaarde versie weggehaald.
// Aanroepen bovenin het <script> van een component, na de velden zelf.
export function bewaarInvoer(naam, lees, zet) {
  const sleutel = `artquake:${naam}`;
  const begin = JSON.stringify(lees());
  let hersteld = $state(false);

  onMount(() => {
    try {
      const opgeslagen = localStorage.getItem(sleutel);
      if (opgeslagen) zet(JSON.parse(opgeslagen));
    } catch {
      // geen toegang tot localStorage (privévenster) of kapotte waarde: niets terugzetten
    }
    hersteld = true;
  });

  $effect(() => {
    const nu = JSON.stringify(lees());
    // pas bewaren als de oude versie is teruggezet, anders gaat die verloren
    if (!hersteld) return;
    try {
      if (nu === begin) localStorage.removeItem(sleutel);
      else localStorage.setItem(sleutel, nu);
    } catch {
      // localStorage vol of geblokkeerd: dan maar niet bewaren
    }
  });
}
