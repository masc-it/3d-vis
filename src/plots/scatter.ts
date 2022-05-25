let configJson = window.fs.readFileSync("conf.json", "utf-8");
let conf = JSON.parse(configJson);

let rawdata = window.fs.readFileSync(conf["data_json"], "utf-8");

let data = JSON.parse(rawdata);

let dataObj = data["data"];
/* 
import hFont from "./Musa_Regular.json"
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json' */
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";

import { Modal } from "bootstrap";
import {
	AmbientLight,
	Box3,
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
import CameraControls from "camera-controls";
import { Plot } from "./plot";
import { createColors, shuffle } from "./utils";

export class ScatterPlot extends Plot {
	raycaster: Raycaster;

	INTERSECTED: any;
	wasOpen = false;
	previousObj: string;

	pointer = new Vector2();

	colors: Color[] = [];

	imgs: { [string: string]: string } = {};

	selectionMode = false;
	selectionBox: SelectionBox;
	selectionHelper: SelectionHelper;

	myModalAlternative: Modal;

	pointsGroup = new Group()

	isMouseDown = false;
	mouseClick = false;

	init = () => {
		this.scene.background = new Color(0xf0f0f0);
		const light = new AmbientLight(0xffffff, 1);
		this.scene.add(light);

		let hist: { [k: number]: number } = {};

		for (let index = 0; index < data["labels"].length; index++) {
			const element = data["labels"][index];

			this.camera.layers.enable(element + 2);
			hist[element] = 0;
		}
		const geometry = new SphereBufferGeometry(0.04, 4, 4);

		this.colors = createColors(data["num_labels"])
		this.colors = shuffle(this.colors)

		this.buildLegend();
		for (let i = 0; i < dataObj.length; i++) {
			let point = dataObj[i];
			const object = new Mesh(
				geometry,
				new MeshLambertMaterial({
					color: point["label"] != -1 ? this.colors[point["label"]] : 0xcacaca,
				})
			);

			hist[point["label"]] += 1;

			let wX = point["x"]; //* 200;

			object.position.x = wX; // Math.random() * 400
			object.position.y = point["y"]; //* 200;
			object.position.z = point["z"]; //* 200;
			if (point["label"] == -1) {
				object.scale.x *= 0.5;
				object.scale.y *= 0.5;
				object.scale.z *= 0.5;
			}

			object.name = "#cube-" + i;
			object.userData = {
				img_name: point["img_name"],
				layer: point["label"] + 2,
			};

			object.layers.set(point["label"] + 2);
			this.pointsGroup.add(object);
		}
		this.pointsGroup.name = "#cube-container";
		this.pointsGroup.layers.enableAll();
		this.pointsGroup.position.set(0, 0, 5);

		this.scene.add(this.pointsGroup);

		//buildBarChart(hist);

		this.raycaster = new Raycaster();
		this.raycaster.layers.enableAll();

		this.selectionListeners();

		document.addEventListener("mousemove", this.onPointerMove);
		document.addEventListener("mousedown", this.onMouseDown);
		document.addEventListener("mouseup", this.onMouseUp);
		document.addEventListener("click", this.onMouseClick);

		window.addEventListener("resize", this.onWindowResize);

		this.createMenu();

		this.myModalAlternative = new Modal(document.getElementById("pics-modal"), {});
	}

	render = () => {

		this.raycaster.setFromCamera(this.pointer, this.camera);
	
		const intersects = this.raycaster.intersectObjects(this.pointsGroup.children, false);
	
		try {
			if (intersects.length > 0) {
				
				//console.log(intersects[0].object)
				if (this.INTERSECTED != intersects[0].object) {
					/* if (INTERSECTED)
						INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex); */
					if (intersects[0].object.name.startsWith("#cube")) {
						//console.log("intersected")
						this.INTERSECTED = intersects[0].object;
						/* INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						INTERSECTED.material.emissive.setHex(0xff0000); */
					}
				}
			} else {
				this.INTERSECTED = undefined;
				/* //console.log("nop")
				if (INTERSECTED) {
					INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
				}
	
				INTERSECTED = undefined; */
			}
		} catch (error) {}
		//_renderer.render(_scene, _camera);
	}

	private _buildCheckbox = (name: string, id: string) => {
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = id;
		checkbox.value = name;
		checkbox.setAttribute("checked", "true");
	
		let idNum = parseInt(id.split("_")[1]);
	
		checkbox.onchange = (e: any) => {
			let layerId = parseInt(id.split("_")[1]) + 2;
			if (e.currentTarget.checked) {
				this.camera.layers.enable(layerId);
				this.raycaster.layers.enable(layerId);
			} else {
				this.camera.layers.disable(layerId);
				this.raycaster.layers.disable(layerId);
			}
		};
		var label = document.createElement("label");
		label.htmlFor = id;
		let t = document.createElement("span");
		t.textContent = name;
	
		if (idNum >= 0) {
			t.style.color = "#" + this.colors[idNum].getHexString();
		} else {
			t.style.color = "#cacaca";
		}
	
		label.appendChild(t);
	
		var container = document.createElement("div");
		container.appendChild(checkbox);
		container.appendChild(label);
		return container;
	}
	
	private buildLegend = () => {
		let labels = data["labels"];
	
		var container = document.createElement("div");
	
		container.style.position = "absolute";
		container.style.backgroundColor = "whitesmoke";
		container.style.top = "10px";
		container.style.left = "10px";
		for (let index = 0; index < labels.length; index++) {
			const element = labels[index];
	
			container.appendChild(
				this._buildCheckbox("Class " + element, "layer_" + element)
			);
		}
	
		let m = document.getElementById("main");
		if (m) m.appendChild(container);
	}

	private selectionListeners = () => {
		document.addEventListener("pointerdown", (event:any) => {
			if (event.target.classList.contains("interactive")) return
			if ( !this.selectionMode) return
			for (const item of this.selectionBox.collection) {
				let i : any = item
				if (!i.name.startsWith("#cube")) continue
				if (!this.camera.layers.isEnabled(i.userData["layer"])) continue
				i.material.emissive.set(0x000000);
			}
	
			this.selectionBox.startPoint.set(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1,
				0.5
			);
		});
	
		document.addEventListener("pointermove",  (event:any) => {
	
			if (event.target.classList.contains("interactive")) return
			if ( !this.selectionMode) return
			if (this.selectionHelper.isDown) {
				for (let i = 0; i < this.selectionBox.collection.length; i++) {
	
					let el = this.selectionBox.collection[i]
					if (!el.name.startsWith("#cube")) continue
					if (!this.camera.layers.isEnabled(el.userData["layer"])) continue
					let mat : any = el.material
					mat.emissive.set(0x000000);
				}
	
				this.selectionBox.endPoint.set(
					(event.clientX / window.innerWidth) * 2 - 1,
					-(event.clientY / window.innerHeight) * 2 + 1,
					0.5
				);
	
				const allSelected = this.selectionBox.select();
	
				for (let i = 0; i < allSelected.length; i++) {
					let el = allSelected[i]
					if (!el.name.startsWith("#cube")) continue
					if (!this.camera.layers.isEnabled(el.userData["layer"])) continue
					let mat : any = el.material
					mat.emissive.set(0xffffff);
				}
			}
		});
	
		document.addEventListener("pointerup", (event:any) => {
	
			if (this.selectionBox == undefined || this.selectionBox.collection.length == 0) return
			if (event.target.classList.contains("interactive")) return
			if ( !this.selectionMode) return
			this.selectionBox.endPoint.set(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1,
				0.5
			);
	
			const allSelected = this.selectionBox.select();
			
			console.log( "camera: "+  this.camera.layers.mask.toString(2))
			let imgNames : string[] = []
			for (let i = 0; i < allSelected.length; i++) {
				let el = allSelected[i]
				if (!el.name.startsWith("#cube")) continue
				
				if (!this.camera.layers.isEnabled(el.userData["layer"])){ 
					continue
				}
				imgNames.push(el.userData["img_name"])
				let mat : any = el.material
				mat.emissive.set(0x000000);
			}
	
			
			if (imgNames.length > 0)
				this.buildImageGrid(imgNames)
			imgNames = []
			this.selectionBox = new SelectionBox(this.camera, this.scene);
			this.selectionHelper = new SelectionHelper(this.selectionBox, this.renderer, "selectBox");
	
	
		});
	}

	private buildImageGrid = (imgNames: string[]) => {
	
		let container = document.getElementById("imgs-container");
	
		container.innerHTML = ""
	
		imgNames.forEach(element => {
			
			let b64 = window.fs.readFileSync(
				conf["dataset_path"] + element,
				{ encoding: "base64" }
			);
			let img = document.createElement("img");
			img.src = `data:image/jpg;base64,${b64}`;
			img.width = 400;
			img.height = 400;
			
			container.appendChild(img);
		});
	
		this.myModalAlternative.toggle()
		
	}
	
	private createMenu = () => {
		
		let container = document.createElement("div")
		container.style.position = "absolute"
		container.style.top = "10px"
		container.style.left = "100px"
		let toHistogram = document.createElement("button")
		toHistogram.type = "button"
		toHistogram.classList.add("btn", "btn-primary")
		toHistogram.textContent = "Histrogram"
		toHistogram.onclick = () => {
			//controls.dispose()
			//this.controls.fitToBox(this.chartGroup, true)
		}
	
		let selectMode = document.createElement("button")
		selectMode.type = "button"
		selectMode.textContent = "Select mode"
		selectMode.onclick = () => {
			//controls.dispose()
			this.selectionMode = !this.selectionMode
			this.controls.enabled = !this.controls.enabled
			this.selectionBox = new SelectionBox(this.camera, this.scene);
			this.selectionHelper = new SelectionHelper(this.selectionBox, this.renderer, "selectBox"); 
		}
	
		container.appendChild(toHistogram)
		container.appendChild(selectMode)
	
		let m = document.getElementById("main");
		if (m) m.appendChild(container)
	
	}

	private onMouseDown = () => {
		this.isMouseDown = true;
	}

	private onMouseClick = (event: any) => {
		if (this.mouseClick) {
			if (!event.target.classList.contains("preview")) {
				this.mouseClick = false;
				this.wasOpen = false;
				this.INTERSECTED = undefined;
				let d = document.getElementById("lol");
				if (d != undefined) {
					d.remove();
				}
			}
		}
		this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar
	
		if (this.INTERSECTED != undefined && this.INTERSECTED.name.startsWith("#cube")) {
			this.mouseClick = true;
		}
	}
	
	private onMouseUp = () => {
		this.isMouseDown = false;
	}
	private onWindowResize = () => {
		//_camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	
	buildPopup = (obj: Mesh, top: any, left: any) => {
		if (this.wasOpen && this.previousObj != undefined && obj.name == this.previousObj) {
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
	
		if (this.imgs[obj.name] == undefined) {
			let b64 = window.fs.readFileSync(
				conf["dataset_path"] + obj.userData["img_name"],
				{ encoding: "base64" }
			);
			console.log("first time");
			this.imgs[obj.name] = b64;
		}
	
		var div = document.createElement("div");
		div.style.width = "400px";
		div.style.height = "430px";
		div.style.background = "white";
		div.style.color = "white";
	
		let img = document.createElement("img");
		img.src = `data:image/jpg;base64,${this.imgs[obj.name]}`;
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
		this.wasOpen = true;
	}
	
	onPointerMove = (event: any) => {
		if (this.isMouseDown || this.mouseClick) return;
		this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar
	
		if (this.INTERSECTED != undefined && this.INTERSECTED.name.startsWith("#cube")) {
			this.buildPopup(this.INTERSECTED, event.clientY, event.clientX);
			this.previousObj = this.INTERSECTED.name;
		} else {
			if (this.wasOpen && !this.mouseClick) {
				try {
					let l = document.getElementById("lol");
					if (l) l.remove();
				} catch (error) {}
				this.wasOpen = false;
			}
		}
	}
}
