// Kleur van een agenda-item. Het standaard-oranje uit het dashboard is
// dezelfde kleur als de achtergrond van de agenda, dus dat (of geen kleur)
// betekent "automatisch": dan bepaalt het type de kleur. Een zelf gekozen
// kleur in het dashboard gaat altijd voor.
export const standaardAgendaKleur = "#f2a81c";

const kleurPerType = {
	workshop: "#8a19e8", // paars
	masterclass: "#8a19e8",
	optreden: "#0b0b0b", // zwart
	"open entree": "#f4f1ea", // crème
	expositie: "#b57bf5", // lichtpaars
	besloten: "#4a0ba0", // donkerpaars
};
const restKleur = "#f4f1ea";

export function agendaKleur(item) {
	const eigen = item.kleur?.toLowerCase();
	if (eigen && eigen !== standaardAgendaKleur) return eigen;
	return kleurPerType[(item.type ?? "").trim().toLowerCase()] ?? restKleur;
}

// leesbare tekstkleur op de gekozen achtergrond
export function agendaTekstKleur(hex) {
	const c = hex.replace("#", "");
	const r = parseInt(c.substring(0, 2), 16);
	const g = parseInt(c.substring(2, 4), 16);
	const b = parseInt(c.substring(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? "#0b0b0b" : "#f4f1ea";
}
