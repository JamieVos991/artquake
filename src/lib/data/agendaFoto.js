// Uitsnede van een agendafoto: welk deel van de foto in beeld blijft.
// Waarde = object-position. Zonder keuze iets boven het midden, omdat
// het onderwerp (een gezicht, een bloem) meestal in de bovenste helft staat.
export const agendaFotoUitsneden = [
	{ waarde: "boven", label: "Boven", positie: "center 20%" },
	{ waarde: "midden", label: "Midden", positie: "center 50%" },
	{ waarde: "onder", label: "Onder", positie: "center 80%" },
];

export function agendaFotoPositie(item) {
	return (
		agendaFotoUitsneden.find((u) => u.waarde === item.fotoUitsnede)?.positie ??
		"center 30%"
	);
}
