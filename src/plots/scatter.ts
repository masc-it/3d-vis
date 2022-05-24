let configJson = window.fs.readFileSync("conf.json", "utf-8");
let conf = JSON.parse(configJson);

let rawdata = window.fs.readFileSync(conf["data_json"], "utf-8");

let data = JSON.parse(rawdata);

let dataObj = data["data"];
/* 
import hFont from "./Musa_Regular.json"
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json' */
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";

import { GUI } from "dat.gui";
import {
	AmbientLight,
	BoxBufferGeometry,
	BoxGeometry,
	Camera,
	Color,
	Group,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	OrthographicCamera,
	PerspectiveCamera,
	Raycaster,
	Renderer,
	Scene,
	SphereBufferGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";


import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper.js";

let container, stats;
let _camera: OrthographicCamera;

let _scene: Scene;
let raycaster: Raycaster;
let _renderer: WebGLRenderer;

let INTERSECTED: any;
let wasOpen = false;
let previousObj: string;

const pointer = new Vector2();

let colors: Color[] = [];

let imgs: { [string: string]: string } = {};

function shuffle(array: any[]) {
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

for (let index = 0; index < 100; index++) {
	let color = new Color(0xffffff);
	color.setHex(Math.random() * 0xffffff);
	colors.push(color);
}

colors = shuffle(colors);

function _buildCheckbox(name: string, id: string) {
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = id;
	checkbox.value = name;
	checkbox.setAttribute("checked", "true");

	let idNum = parseInt(id.split("_")[1]);

	checkbox.onchange = function (e: any) {
		let layerId = parseInt(id.split("_")[1]) + 2;
		if (e.currentTarget.checked) {
			_camera.layers.enable(layerId);
			raycaster.layers.enable(layerId);
		} else {
			_camera.layers.disable(layerId);
			raycaster.layers.disable(layerId);
		}
	};
	var label = document.createElement("label");
	label.htmlFor = id;
	let t = document.createElement("span");
	t.textContent = name;

	if (idNum >= 0) {
		t.style.color = "#" + colors[idNum].getHexString();
	} else {
		t.style.color = "#cacaca";
	}

	label.appendChild(t);

	var container = document.createElement("div");
	container.appendChild(checkbox);
	container.appendChild(label);
	return container;
}

function buildLegend() {
	let labels = data["labels"];

	var container = document.createElement("div");

	container.style.position = "absolute";
	container.style.backgroundColor = "whitesmoke";
	container.style.top = "10px";
	container.style.left = "10px";
	for (let index = 0; index < labels.length; index++) {
		const element = labels[index];

		container.appendChild(
			_buildCheckbox("Class " + element, "layer_" + element)
		);
	}

	let m = document.getElementById("main");
	if (m) m.appendChild(container);
}
let pointsGroup = new Group()

export function init(scene: Scene, renderer: WebGLRenderer, camera: OrthographicCamera) {
	
	_scene = scene
	_renderer = renderer
	_camera = camera
	scene.background = new Color(0xf0f0f0);
	const light = new AmbientLight(0xffffff, 1);
	scene.add(light);

	let hist: { [k: number]: number } = {};

	for (let index = 0; index < data["labels"].length; index++) {
		const element = data["labels"][index];

		camera.layers.enable(element + 2);
		hist[element] = 0;
	}
	const geometry = new SphereBufferGeometry(0.04, 4, 4);

	buildLegend();
	let meanX = 0;
	let meanY = 0;
	let meanZ = 0;
	let num = 0;

	let minX = 100000;

	
	for (let i = 0; i < dataObj.length; i++) {
		let point = dataObj[i];
		const object = new Mesh(
			geometry,
			new MeshLambertMaterial({
				color: point["label"] != -1 ? colors[point["label"]] : 0xcacaca,
			})
		);

		hist[point["label"]] += 1;

		let wX = point["x"] //* 200;
		if (wX < minX) {
			minX = wX;
		}

		object.position.x = wX; // Math.random() * 400
		object.position.y = point["y"] //* 200;
		object.position.z = point["z"] //* 200;
		if (point["label"] == -1) {
			object.scale.x *= 0.5;
			object.scale.y *= 0.5;
			object.scale.z *= 0.5;
		}

		object.name = "#cube-" + i;
		object.userData = {
			img_name: point["img_name"],
		};

		if (i < 300) {
			meanX += object.position.x;
			meanY += object.position.y;
			meanZ += object.position.z;
			num += 1;
		}

		object.layers.set(point["label"] + 2);
		pointsGroup.add(object)

	}
	pointsGroup.name = "#cube-container"
	pointsGroup.layers.enableAll()
	pointsGroup.position.set(0,0, 5)

	scene.add(pointsGroup);
	meanX /= num;
	meanY /= num;
	meanZ /= num;
/* 
	const wallGeo = new BoxGeometry(1, 1, 1);
	const wall1 = new Mesh(wallGeo, new MeshLambertMaterial({ color: 0x000000 }));

	wall1.scale.x *= 10;
	wall1.scale.y *= 10;
	scene.add(wall1); */

	/* camera.position.setX(wall1.position.x) //= wall1.position
    camera.position.setY(wall1.position.y)
    camera.position.setZ(wall1.position.z - 100) */

	/* const fontt = new FontLoader().parse(typefaceFont);

	for (let index = 0; index < data["labels"].length; index++) {
		const element = data["labels"][index];

		const h = hist[element] * 0.5;
		const histGeometry = new BoxGeometry(1, 1, 1);
		const object = new Mesh(
			histGeometry,
			new MeshLambertMaterial({
				color: element != -1 ? colors[element] : 0xcacaca,
			})
		);

		object.position.set(minX  + 1 * index, meanY, meanZ);
		object.rotation.y = 0.2;

		object.scale.y *= h;
		object.translateY(h / 2);

		const tGeo = new TextGeometry(hist[element].toString(), {
			font: fontt,
			size: 10,
			height: 5,
		});

		const tMat = new MeshLambertMaterial({ color: 0xffffff });
		var tMesh = new Mesh(tGeo, tMat);

		tMesh.position.set(minX - 1015 + 50 * index, meanY, meanZ);
		tMesh.rotation.y = 0.2;
		tMesh.translateY(h);

		object.layers.set(element + 2);
		tMesh.layers.set(element + 2);

		scene.add(object);
		scene.add(tMesh);
	} */

	raycaster = new Raycaster();
	raycaster.layers.enableAll();

	/* 
    camera.rotation.x = -0.03836148783319388 // -100 *0.0174533
    camera.rotation.y = -0.0066722240508255886 //100 *0.0174533
    camera.rotation.z = -0.00025608016552217886 //-100 *0.0174533 */

	/* const selectionBox = new SelectionBox(camera, scene);
	const helper = new SelectionHelper(selectionBox, renderer, "selectBox");
 */
	/* document.addEventListener("pointerdown", function (event) {
		for (const item of selectionBox.collection) {
            let i : any = item
			i.material.emissive.set(0x000000);
		}

		selectionBox.startPoint.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
			0.5
		);
	});

	document.addEventListener("pointermove", function (event) {
		if (helper.isDown) {
			for (let i = 0; i < selectionBox.collection.length; i++) {

                let mat : any = selectionBox.collection[i].material
				mat.emissive.set(0x000000);
			}

			selectionBox.endPoint.set(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1,
				0.5
			);

			const allSelected = selectionBox.select();

			for (let i = 0; i < allSelected.length; i++) {
                let mat : any = allSelected[i].material
				mat.emissive.set(0xffffff);
			}
		}
	});

	document.addEventListener("pointerup", function (event) {
		selectionBox.endPoint.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
			0.5
		);

		const allSelected = selectionBox.select();

		for (let i = 0; i < allSelected.length; i++) {
            let mat : any = allSelected[i].material
			mat.emissive.set(0xffffff);
		}
	}); */

	document.addEventListener("mousemove", onPointerMove);
	document.addEventListener("mousedown", onMouseDown);
	document.addEventListener("mouseup", onMouseUp);
	document.addEventListener("click", onMouseClick);

	window.addEventListener("resize", onWindowResize);


    createMenu()

}


function createMenu() {
    
    let container = document.createElement("div")
    container.style.position = "absolute"
    container.style.top = "10px"
    container.style.left = "100px"
    let selectMode = document.createElement("button")
    selectMode.type = "button"
    selectMode.textContent = "Select mode"
    selectMode.onclick = () => {
        //controls.dispose()
    }

    container.appendChild(selectMode)

    let m = document.getElementById("main");
	if (m) m.appendChild(container)

}

let isMouseDown = false;
let mouseClick = false;
function onMouseDown() {
	isMouseDown = true;
}
function onMouseClick(event: any) {
	if (mouseClick) {
		if (!event.target.classList.contains("preview")) {
			mouseClick = false;
			wasOpen = false;
			INTERSECTED = undefined;
			let d = document.getElementById("lol");
			if (d != undefined) {
				d.remove();
			}
		}
	}
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar

	if (INTERSECTED != undefined && INTERSECTED.name.startsWith("#cube")) {
		mouseClick = true;
	}
}

function onMouseUp() {
	isMouseDown = false;
}
function onWindowResize() {
	//_camera.aspect = window.innerWidth / window.innerHeight;
	_camera.updateProjectionMatrix();

	_renderer.setSize(window.innerWidth, window.innerHeight);
}

function buildPopup(obj: Mesh, top: any, left: any) {
	if (wasOpen && previousObj != undefined && obj.name == previousObj) {
		let d = document.getElementById("lol");
		if (d != undefined) {
			d.style.left = left + 20 + "px";
			d.style.top = top + "px";
		}

		return;
	} else {
		try {
			let d = document.getElementById("lol");
			if (d) d.remove();
		} catch (error) {}
	}

	//window.shell.showItemInFolder(conf["dataset_path"] + obj.userData["img_name"])
	if (imgs[obj.name] == undefined) {
		let b64 = window.fs.readFileSync(
			conf["dataset_path"] + obj.userData["img_name"],
			{ encoding: "base64" }
		);
		console.log("first time");
		imgs[obj.name] = b64;
	}

	var div = document.createElement("div");
	div.style.width = "400px";
	div.style.height = "430px";
	div.style.background = "white";
	div.style.color = "white";

	let img = document.createElement("img");
	img.src = `data:image/jpg;base64,${imgs[obj.name]}`;
	img.width = 400;
	img.height = 400;
	img.classList.add("preview");
	div.appendChild(img);

	let openBtn = document.createElement("button");
	openBtn.textContent = "open";
	openBtn.type = "button";
	openBtn.classList.add("preview");
	openBtn.onclick = function (e: any) {
		e.preventDefault();
		window.shell.showItemInFolder(
			conf["dataset_path"] + obj.userData["img_name"]
		);
		return false;
	};
	div.appendChild(openBtn);

	/* div.innerHTML = `<img class='preview' width='400px' height='400px' src='data:image/jpg;base64,${
		imgs[obj.name]
	}'/>`; */
	div.id = "lol";
	div.classList.add("preview");
	div.style.position = "absolute";
	div.style.left = left + 20 + "px";
	div.style.top = top + "px";
	let m = document.getElementById("main");
	if (m) m.appendChild(div);
	wasOpen = true;
}

function onPointerMove(event: any) {
	if (isMouseDown || mouseClick) return;
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar

	if (INTERSECTED != undefined && INTERSECTED.name.startsWith("#cube")) {
		buildPopup(INTERSECTED, event.clientY, event.clientX);
		previousObj = INTERSECTED.name;
	} else {
		if (wasOpen && !mouseClick) {
			try {
				let l = document.getElementById("lol");
				if (l) l.remove();
			} catch (error) {}
			wasOpen = false;
		}
	}
}

export function render() {

	raycaster.setFromCamera(pointer, _camera);

	const intersects = raycaster.intersectObjects(pointsGroup.children, false);

	try {
		if (intersects.length > 0) {
			
			//console.log(intersects[0].object)
			if (INTERSECTED != intersects[0].object) {
				/* if (INTERSECTED)
					INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex); */
				if (intersects[0].object.name.startsWith("#cube")) {
					//console.log("intersected")
					INTERSECTED = intersects[0].object;
					/* INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
					INTERSECTED.material.emissive.setHex(0xff0000); */
				}
			}
		} else {
			INTERSECTED = undefined;
			/* //console.log("nop")
			if (INTERSECTED) {
				INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
			}

			INTERSECTED = undefined; */
		}
	} catch (error) {}
	//_renderer.render(_scene, _camera);
}
