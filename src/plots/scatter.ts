import { Modal } from "bootstrap";
import {
	Box3,
	BoxBufferGeometry,
	Color,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshStandardMaterial,
	Object3D,
	PointLight,
	Raycaster,
	SphereBufferGeometry,
	SphereGeometry,
	SpotLight,
	SpotLightHelper,
	Vector2,
	Vector3,
} from "three";


import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

import { Plot } from "./plot";
import { createColors, CustomElement, shuffle } from "./utils";
import { Bar } from "./bar";
import { DataConfig } from "../utils/dataconfig";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

export class ScatterPlot extends Plot {
	raycaster: Raycaster;

	INTERSECTED: any;
	wasOpen = false;
	previousObj: string;

	pointer = new Vector2();

	colors: Color[] = [];

	imgs: { [string: string]: string } = {};

	imageGridModal: Modal;

	selectionMode = false

	pointsGroup : Group
	plotGroup : Group

	isMouseDown = false;
	mouseClick = false;

	labelColors : { [k: number]: Color } = {};

	barChart : Bar
	pointsGroupCenter : Vector3

	plotHasFocus = true

	init = (x: number, y: number, z: number) => {

		this.x = x
		this.y = y
		this.z = z

		this.plotGroup = new Group()
		//this.plotGroup.layers.enableAll();
		this.pointsGroup = new Group()
		//this.pointsGroup.layers.enableAll();

		let hist: { [k: number]: number } = {};

		this.colors = createColors(this.dataInfo["num_labels"])
		this.colors = shuffle(this.colors)

		for (let index = 0; index < this.dataInfo["labels"].length; index++) {
			const element = this.dataInfo["labels"][index];

			//this.camera.layers.enable(element + 2);
			hist[element] = 0;
			this.labelColors[element] = this.colors[index]

		}

		let segments = 5
		let radius = 0.04
		if (this.dataObj.length > 5000){
			segments = 3
			radius = 0.02
		}
		const geometry = new SphereBufferGeometry(radius, segments, segments);

		//this.buildLegend();
		for (let i = 0; i < this.dataObj.length; i++) {
			let point = this.dataObj[i];
			const object = new Mesh(
				geometry,
				new MeshLambertMaterial({
					color: point["label"] != -1 ? this.labelColors[point["label"]] : 0xcacaca,
				})
			);

			hist[point["label"]] += 1;

			object.position.x = point["x"];
			object.position.y = point["y"]; 
			object.position.z = point["z"]; 
			if (point["label"] == -1) {
				object.scale.x *= 0.5;
				object.scale.y *= 0.5;
				object.scale.z *= 0.5;
			}

			object.name = "#cube-"+ this.name + "-" + i;
			object.userData = {
				img_name: point["img_name"],
				layer: point["label"] ,
			};

			//object.castShadow = true
			//object.layers.set(point["label"] + 2);
			this.pointsGroup.add(object);
		}
		//this.pointsGroup.castShadow = true
		this.pointsGroup.name = "#cube-" + this.name + "-" + "container";
		this.plotGroup.name = "#cube-" + this.name + "-" + "container";
		this.pointsGroup.position.set(x, y, z); // 0 0 5

		this.scene.updateMatrixWorld()
		this.pointsGroupCenter = new Vector3()
		new Box3().setFromObject(this.pointsGroup).getCenter(this.pointsGroupCenter)

		// covering box
		let v = new Vector3()
		let b = new Box3().setFromObject(this.pointsGroup)
		b.getSize(v)

		let scatterWidth = v.x
		let scatterHeight = v.y
		let scatterZ = v.z

		this.pointsGroup.translateY(-scatterHeight*0.5 )
		this.pointsGroup.translateZ(scatterZ * 0.9)
		this.objectToFocus = this.pointsGroup
		this.scene.add(this.pointsGroup);

		this.pointsGroupCenter = new Vector3()
		new Box3().setFromObject(this.pointsGroup).getCenter(this.pointsGroupCenter)
		
		//const boxGeometry = new BoxBufferGeometry(scatterWidth*1.2, scatterHeight*1.2, 0.1);
		const boxGeometry = new BoxBufferGeometry(1, 1, 0.1);
		this.boxObject = new Mesh(
			boxGeometry,
			new MeshLambertMaterial({
				color: 0x000000,
			})
		);
		
		boxGeometry.scale(scatterWidth*1.2, scatterHeight*1.2, 1)

		this.boxObject.position.set(this.pointsGroupCenter.x, this.pointsGroupCenter.y /2 + y/2, this.pointsGroupCenter.z /2 + z/2 )
		//boxObject.translateY(scatterHeight)
		
		this.plotGroup.add(this.boxObject)
		
		// title
		// scatter name
		const fontt = new FontLoader().parse(typefaceFont);
		
		const tGeo = new TextGeometry(this.name, {
			font: fontt,
			size: 0.8,
			height: 0.5,
			
		});

		this.scene.updateMatrixWorld()
		
		let boxC = new Vector3()
		this.boxObject.getWorldPosition(boxC)

		const tMat = new MeshLambertMaterial({ color: 0xffffff });
		var tMesh = new Mesh(tGeo, tMat);
		tMesh.position.set(this.pointsGroupCenter.x/2 + x/2, this.pointsGroupCenter.y/2 + this.y/2 , this.pointsGroupCenter.z /2 +z/2 );
		//tMesh.position.set(this.pointsGroupCenter.x/2 + x/2, boxC.y + h/2 , boxC.z  );
		this.plotGroup.add(tMesh)

		//const sphere = new SphereGeometry( 0.1, 16, 8 );
		let light1 = new PointLight( 0xffffff, 0.5, 200 );
		//light1.add( new Mesh( sphere, new MeshBasicMaterial( { color: 0xffffff } ) ) );
		light1.position.set(this.pointsGroupCenter.x/2 + x/2, this.pointsGroupCenter.y*2 , this.pointsGroupCenter.z * 2.5 )
		this.plotGroup.add(light1)
		
		this.scene.add(this.plotGroup)

		this.build3DLegend()
		this.buildSelectionMenu()
		this.raycaster = new Raycaster();
		//this.raycaster.layers.enableAll();

		this.selectionListeners();

		document.addEventListener("mousemove", this.onPointerMove);
		document.addEventListener("mousedown", this.onMouseDown);
		document.addEventListener("mouseup", this.onMouseUp);
		document.addEventListener("click", this.onMouseClick);

		//this.createMenu();

		this.imageGridModal = new Modal(document.getElementById("pics-modal"), {});
		this.legendModal = new Modal(document.getElementById("legend-modal"), {});
		/* const barData = {
			"hist" : hist,
			"labels": this.dataInfo["labels"],
			"colors": this.labelColors
		} */
		//this.barChart = new Bar(this.scene, this.renderer, this.camera, this.controls, barData)
		
	}

	resetState = () => {
		this.selectionMode = false
		this.plotHasFocus = false
		this.plotIsRendered = false
		this.controls.enabled = true
	}
	setupData = (dataConfig: DataConfig) => {

		this.dataConfig = dataConfig
		let rawdata = window.fs.readFileSync(dataConfig.dataJson, "utf-8");
		let data = JSON.parse(rawdata);

		this.name = dataConfig.name
		this.dataInfo = data
		this.dataObj = data["data"];
		
	}

	build3DLegend = () => {

		this.legendRaycaster = new Raycaster();
		this.scene.updateMatrixWorld()
		
		this.legendGroup = new Group()
		this.legendMap = {}
		let bbox = new Box3().setFromObject(this.boxObject)

		let w = bbox.max.x - bbox.min.x
		let h = bbox.max.y - bbox.min.y

		let boxC = new Vector3()

		this.boxObject.getWorldPosition(boxC)

		const fontt = new FontLoader().parse(typefaceFont);
		
		const legendBtnText = "Legend"
		const tGeo = new TextGeometry(legendBtnText, {
			font: fontt,
			size: 0.1,
			height: 0.05,
			
		});

		const boxGeometry = new BoxBufferGeometry(0.6, 0.3, 0.3);
		
		// get top left corner
		let startY = boxC.y + h/2 - 0.6
		let startX = boxC.x - w/2 + 0.6

		let zPos = this.pointsGroupCenter.z /2 + this.z/2
		let legendButton = new Mesh(
			boxGeometry,
			new MeshLambertMaterial({
				color: 0xffffff,
			})
		);
		
		legendButton.position.set(startX, startY, zPos )
		legendButton.name = "#legendbtn"

		const tMat = new MeshLambertMaterial({ color: 0x000000 });
		var tMesh = new Mesh(tGeo, tMat);
		tMesh.position.set(startX - 0.034 * legendBtnText.length , startY - 0.05 , zPos + 0.11 );
		this.legendGroup.add(tMesh)
		
		this.legendGroup.add(legendButton)
		
		this.scene.add(this.legendGroup)
		
		for (let index = 0; index < this.dataInfo["labels"].length; index++) {
			const element = this.dataInfo["labels"][index];
			this.legendMap[element] = true
		}

	}

	private _buildCheckbox = (name: string, id: string) => {

		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.className = "label-checkbox"
		checkbox.id = id;
		checkbox.value = name;

		let label = parseInt(id.split("_")[1]);

		if (this.legendMap[label])
			checkbox.setAttribute("checked", "true");
	
		let idNum = parseInt(id.split("_")[1]);
		
		checkbox.onchange = (e: any) => {
			
			this.legendMap[label] = !this.legendMap[label]

			let objects = this.getGroupElementsByLayer(this.pointsGroup, label)
			
			this.toggleElements(objects)

			this.requestWorldUpdate = true

		};
		var labelEl = document.createElement("label");
		labelEl.htmlFor = id;
		let t = document.createElement("span");
		t.textContent = name;
		t.style.marginLeft = "5px"
	
		if (idNum >= 0) {
			t.style.color = "#" + this.labelColors[idNum].getHexString();
		} else {
			t.style.color = "#cacaca";
		}
	
		labelEl.appendChild(t);
	
		var container = document.createElement("div");
		
		container.appendChild(checkbox);
		container.appendChild(labelEl);
		return container;
	}
	
	private buildLegend = () => {
		let labels : any[] = this.dataInfo["labels"]
	
		var container = document.getElementById("legend-container");
		container.innerHTML = ""
		
		// Button to quick toggle all legend checkboxes
		let toggleAllBtn = document.createElement("button")
		toggleAllBtn.className = "btn btn-primary"
		toggleAllBtn.textContent = "Toggle all"

		toggleAllBtn.onclick = (e) => {

			let checkboxes = document.getElementsByClassName("label-checkbox")

			for (let index = 0; index < checkboxes.length; index++) {
				const element : any = checkboxes[index];
				
				element.onchange()
				element.checked ^= 1
			}

		}
		container.appendChild(toggleAllBtn)


		for (let index = 0; index < labels.length; index++) {
			const element = labels[index];
	
			container.appendChild(
				this._buildCheckbox("Class " + element, "layer_" + element)
			);
		}
		this.plotHasFocus = false
		this.legendModal.toggle()
	}



	buildSelectionMenu = () => {
		this.scene.updateMatrixWorld()
		
		let bbox = new Box3().setFromObject(this.boxObject)

		let w = bbox.max.x - bbox.min.x
		let h = bbox.max.y - bbox.min.y

		let boxC = new Vector3()

		this.boxObject.getWorldPosition(boxC)

		const boxGeometry = new BoxBufferGeometry(0.3, 0.3, 0.3);
		
		let startY = boxC.y - h/2 + 0.6
		
		this.selectionBox = new Mesh(
			boxGeometry,
			new MeshLambertMaterial({
				color: 0xFF0000,
			})
		);
		this.selectionBox.position.set(boxC.x - w/2 + 0.6, startY, this.pointsGroupCenter.z /2 + this.z/2 + 0.1 )
		this.selectionBox.name = "#selection_" + this.name
		this.selectionBox.userData = {
			"name": this.name
		}
		
		this.scene.add(this.selectionBox)
		this.selectionRaycaster = new Raycaster();

		
	}


	render = () => {
		
		this.raycastPopup()
	}

	private getGroupElementsByLayer = (group: Group, layer: number) => {
		
		let children = group.children
		return children.filter(e => e.userData["layer"] == layer)

	}

	private toggleElements = (elements : Object3D[]) => {
		
		elements.forEach(e => e.visible = !e.visible)
	}

	

	private legendSelection = () => {
		this.legendRaycaster.setFromCamera(this.pointer, this.camera);
	
		const intersects = this.legendRaycaster.intersectObjects(this.legendGroup.children, false);
	
		if (intersects.length > 0) {
			
			let el = intersects[0].object
			
			this.buildLegend()
		}
		
	}

	private raycastSelectionBtn = () => {
		this.selectionRaycaster.setFromCamera(this.pointer, this.camera);
	
		const intersects = this.selectionRaycaster.intersectObject(this.selectionBox, true);
	
		if (intersects.length > 0) {
			this.selectionMode = !this.selectionMode
			//console.log(this.selectionMode)
			this.controls.enabled = !this.selectionMode

			if (this.selectionMode){
				this.world.createSelectionUtils()

				this.selectionBox.material.color = new Color(0x00ff00)
				this.selectionBox.position.z -= 0.1
			} else {
				this.selectionBox.material.color = new Color(0xff0000)
				this.selectionBox.position.z += 0.1
			}

			this.requestWorldUpdate = true
		}
	}

	private raycastPopup = () => {

		if (!this.plotHasFocus) return
		this.raycaster.setFromCamera(this.pointer, this.camera);
	
		const intersects = this.raycaster.intersectObjects(this.pointsGroup.children, false);
	
		try {
			if (intersects.length > 0) {
				
				if (this.INTERSECTED != intersects[0].object) {
					
					let obj = intersects[0].object
					let layer = obj.userData["layer"]
					let isEnabled = this.legendMap[layer]
					if (obj.name.startsWith("#cube") && isEnabled ) {
						//console.log("intersected")
						this.INTERSECTED = obj
						
					}
				}
			} else {
				this.INTERSECTED = undefined;

			}
		} catch (error) {}
	}

	private selectionListeners = () => {
		
		document.addEventListener("pointerdown", (event:any) => {
			
			if (!this.plotIsRendered) return
			if (event.target.classList.contains("close")){
				this.imageGridModal.hide()
				this.legendModal.hide()
				this.plotHasFocus = true
				return
			}

			if (event.target.classList.contains("interactive")){
				return
			}
			if ( !this.selectionMode) return
			for (const item of this.world.selectionBox.collection) {
				let i : any = item
				if (!i.name.startsWith("#cube")) continue
				if (!this.legendMap[i.userData["layer"]]) continue

				i.material.emissive.set(0x000000);
				
			}
	
			this.world.selectionBox.startPoint.set(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1,
				0.5
			);
			this.requestWorldUpdate = true
		});
	
		document.addEventListener("pointermove",  (event:any) => {
			
			if (!this.plotIsRendered) return
			if (event.target.classList.contains("interactive")) return
			if ( !this.selectionMode) return
			if (!this.plotHasFocus) return
			if (this.world.selectionHelper.isDown) {
				for (let i = 0; i < this.world.selectionBox.collection.length; i++) {
	
					let el = this.world.selectionBox.collection[i]
					if (!el.name.startsWith("#cube")) continue
					if (!this.legendMap[el.userData["layer"]]) continue
					let mat : any = el.material
					mat.emissive.set(0x000000);
					this.requestWorldUpdate = true
				}
				
				this.world.selectionBox.endPoint.set(
					(event.clientX / window.innerWidth) * 2 - 1,
					-(event.clientY / window.innerHeight) * 2 + 1,
					0.5
				);
				
				const allSelected = this.world.selectionBox.select();
	
				for (let i = 0; i < allSelected.length; i++) {
					let el = allSelected[i]
					if (!el.name.startsWith("#cube")) continue
					if (!this.legendMap[el.userData["layer"]]) continue
					let mat : any = el.material
					mat.emissive.set(0xffffff);
					this.requestWorldUpdate = true
				}
				
			}
		});
	
		document.addEventListener("pointerup", (event:any) => {
			
			if (!this.plotIsRendered) return
			if (this.world.selectionBox == undefined || this.world.selectionBox.collection.length == 0) return
			if (event.target.classList.contains("interactive")) return
			if ( !this.selectionMode) return
			this.world.selectionBox.endPoint.set(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1,
				0.5
			);
	
			const allSelected = this.world.selectionBox.select();
			
			//console.log( "camera: "+  this.camera.layers.mask.toString(2))
			let imgNames : string[] = []
			for (let i = 0; i < allSelected.length; i++) {
				let el = allSelected[i]
				if (!el.name.startsWith("#cube")) continue
				if (!this.legendMap[el.userData["layer"]]) continue

				imgNames.push(el.userData["img_name"])
				let mat : any = el.material
				mat.emissive.set(0x000000);
				this.requestWorldUpdate = true
			}
			
	
			
			if (imgNames.length > 0)
				this.buildImageGrid(imgNames)
			imgNames = []
	
		});
	}

	private buildImageGrid = (imgNames: string[]) => {
	
		let container = document.getElementById("imgs-container");
		container.innerHTML = ""
		
		imgNames.forEach(element => {
			
			let imgPath = element;
			if (this.imgs[element] == undefined) {
				let b64 = window.fs.readFileSync(
					imgPath,
					{ encoding: "base64" }
				);
				this.imgs[element] = b64
			}

			let img = document.createElement("img");
			img.src = `data:image/jpg;base64,${this.imgs[element]}`;
			img.width = 400;
			//img.height = 400;
			
			container.appendChild(img);
		});
		
		this.plotHasFocus = false
		this.imageGridModal.toggle()
		
	}
	
	private createMenu = () => {
		
		let container = document.createElement("div")
		container.style.position = "absolute"
		container.style.maxWidth = "140px"
		container.style.top = "10px"
		container.style.left = "100px"
		container.classList.add("row")

		let toHistogram = document.createElement("button")
		toHistogram.type = "button"
		toHistogram.classList.add("btn", "btn-outline-dark", "mb-1")
		toHistogram.textContent = "Find histrogram"
		toHistogram.onclick = () => {
			//controls.dispose()
			this.controls.fitToBox(this.barChart.chartGroup, true)
		}

		let findCluster = document.createElement("button")
		findCluster.type = "button"
		findCluster.classList.add("btn", "btn-outline-dark", "mb-1")
		findCluster.textContent = "Find scatter plot"
		findCluster.onclick = () => {
			//controls.dispose()
			this.controls.fitToBox(this.pointsGroup, true)
		}
	

		container.appendChild(findCluster)
		container.appendChild(toHistogram)
	
		let m = document.getElementById("main");
		if (m) m.appendChild(container)
	
	}

	private onMouseDown = () => {
		this.isMouseDown = true;
	}

	private onMouseClick = (event: any) => {

		if (!this.plotIsRendered) return

		this.raycastSelectionBtn()
		this.legendSelection()

		if (this.mouseClick) {
			if (!event.target.classList.contains("preview")) {
				this.mouseClick = false;
				this.wasOpen = false;
				this.INTERSECTED = undefined;
				let d = document.getElementById("preview-popup");
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
	
	buildPopup = (obj: Mesh, top: any, left: any) => {

		//let divWidth = 400
		
		if (this.wasOpen && this.previousObj != undefined && obj.name == this.previousObj) {
			
			return;
		} else {
			try {
				let d = document.getElementById("preview-popup");
				if (d) d.remove();
			} catch (error) {}
		}
		let imgPath = obj.userData["img_name"];

		if (this.imgs[obj.name] == undefined) {
			
			let b64 = window.fs.readFileSync(
				imgPath,
				{ encoding: "base64" }
			);
			//console.log("first time");
			this.imgs[obj.name] = b64;
		}
	
		var div = document.createElement("div");
		//div.style.width = divWidth + "px";
		//div.style.height = "434px";
		div.style.background = "white";
		div.style.color = "white";
	
		let img = document.createElement("img");
		img.src = `data:image/jpg;base64,${this.imgs[obj.name]}`;
		
		img.onload = (e: Event) => {
		
			//let ratio = img.naturalWidth / img.naturalHeight

			//if (img.naturalWidth > img.naturalHeight) {
				let divWidth = Math.min(600, img.naturalWidth);
				
				img.width = divWidth
				//img.height = divWidth;
				div.style.width = divWidth + "px";
			//}
		
		//div.style.height = img.height + "px"

		img.classList.add("preview");

		//console.log(`${top + img.clientHeight + 30}`)
		//console.log(`${window.innerHeight} - ${img.height}`)
		if ( top + img.height + 30 >= window.innerHeight ){
			div.style.top = (2) + "px";
			//div.style.height = img.height + "px"
			//console.log(`ehila ${ top + img.clientHeight + 30}`)
		} else {
			div.style.top = top + "px";
		}
		let openBtn = document.createElement("button");
		openBtn.textContent = "Show in folder";
		openBtn.type = "button";
		openBtn.classList.add("preview", "btn", "btn-outline-dark", "ms-1");
		openBtn.style.padding = "2px"
		openBtn.onclick = (e: any) => {
			e.preventDefault();
			window.shell.showItemInFolder(
				imgPath
			);
			return false;
		};
		div.appendChild(img);
		div.appendChild(openBtn);
	
		div.id = "preview-popup";
		div.classList.add("preview");
		div.style.position = "absolute";

		if ( left + divWidth >= window.innerWidth ){
			div.style.left = (left - 20 - divWidth) + "px";
		} else {
			div.style.left = left + 20 + "px";
		}

		let m = document.getElementById("main");
		if (m) m.appendChild(div);
		this.wasOpen = true;
	}
	}
	
	onPointerMove = (event: any) => {

		if (!this.plotIsRendered) return
		
		if (this.isMouseDown || this.mouseClick) return;
		this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar
	
		if (this.INTERSECTED != undefined && this.INTERSECTED.name.startsWith("#cube")) {
			this.buildPopup(this.INTERSECTED, event.clientY, event.clientX);
			this.previousObj = this.INTERSECTED.name;
		} else {
			if (this.wasOpen && !this.mouseClick) {
				try {
					let l = document.getElementById("preview-popup");
					if (l) l.remove();
				} catch (error) {}
				this.wasOpen = false;
			}
		}
	}
	dataObj: any[];
	dataConfig: DataConfig;
	dataInfo: any;
	name: string;
	boxObject: Mesh<BoxBufferGeometry, MeshLambertMaterial>;
	selectionBox: Mesh<BoxBufferGeometry, MeshLambertMaterial>;
	selectionRaycaster: Raycaster;
	plotIsRendered: boolean;
	legendRaycaster: Raycaster;
	legendGroup: Group;
	legendMap: {[k:string]:boolean}
	legendLabel: CSS2DObject;
	legendDiv: HTMLDivElement;
	legendModal: Modal;
}
