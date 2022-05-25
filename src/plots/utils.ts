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

export function createCallback(callbackName: string, element: HTMLElement, f : (e: any) => any ){
	let event : any = new Event(callbackName);

	element.addEventListener(event, f, false)
}

export class CustomElement {
	element: HTMLElement;

	events : {[k:string]: any} = {}

	constructor(element: HTMLElement){
		this.element = element
	}

	subscribe = (eventName: string, f : (e: any) => any ) => {
		let event : any = new Event(eventName);
		this.events[eventName] = event
		this.element.addEventListener(eventName, f)
	}

	notify = (eventName : string) => {
		this.element.dispatchEvent(this.events[eventName])
	}

}