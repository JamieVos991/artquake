// Teksten rond agenda-items, gedeeld door de homepage en het dashboard.

// Workshops en jamsessies zijn bij ons op locatie
export const standaardLocatie = "Creative Space Artquake, Heerhugowaard";
export const locatieSuggesties = [standaardLocatie, "Poppodium B3, St. Pancras"];

// Alle activiteiten van Artquake zijn gratis; staat er geen prijs, dan is het gratis
export const standaardPrijs = "Gratis";
export function agendaPrijs(item) {
	return item.prijs?.trim() || standaardPrijs;
}

// Het is nooit één optreden: oude items met "Optreden" tonen als "Optredens"
export function agendaType(item) {
	const type = (item.type ?? "").trim();
	return type.toLowerCase() === "optreden" ? "Optredens" : type;
}

