import { Color } from "three";


export function shuffle(array: any[]) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}

export function createColors(n:number) {
    let colors: Color[] = []
    for (let index = 0; index < n; index++) {
        let color = new Color(0xffffff);
        color.setHex(Math.random() * 0xffffff);
        colors.push(color);
    }
    return colors
}