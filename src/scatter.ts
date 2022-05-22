
let configJson = window.fs.readFileSync(
	"conf.json",
	"utf-8"
);
let conf = JSON.parse(configJson);

let rawdata = window.fs.readFileSync(
	conf["data_json"],
	"utf-8"
);

let data = JSON.parse(rawdata);

let dataObj = data["data"]
/* 
import hFont from "./Musa_Regular.json"
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json' */
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'


import { GUI } from "dat.gui";
import {
    AmbientLight,
	BoxBufferGeometry,
	BoxGeometry,
	Camera,
	Color,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	PerspectiveCamera,
	Raycaster,
	Renderer,
	Scene,
	SphereBufferGeometry,
	Vector2,
	Vector3,
	WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js"

let container, stats;
let camera: PerspectiveCamera;

let scene: Scene;
let raycaster: Raycaster;
let renderer: WebGLRenderer;

let INTERSECTED: any;
let wasOpen = false;
let previousObj: string;

const pointer = new Vector2();

let controls: OrbitControls;
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

function _buildCheckbox(name:string, id: string) {
    
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.value = name;
    checkbox.setAttribute("checked", "true")
    
    let idNum = parseInt(id.split("_")[1])

    checkbox.onchange = function (e: any) {

        let layerId = parseInt(id.split("_")[1]) +2
        if (e.currentTarget.checked){
            camera.layers.enable( layerId )
            raycaster.layers.enable(layerId)
        } else {
            camera.layers.disable( layerId )
            raycaster.layers.disable( layerId )
        }

    }
    var label = document.createElement('label')
    label.htmlFor = id;
    let t = document.createElement('span')
    t.textContent = name
    
    if ( idNum >= 0){

        t.style.color = "#" + colors[idNum].getHexString()
    } else {

        t.style.color = "#cacaca"

    }

    
    label.appendChild(t);
    
    var container = document.createElement('div');
    container.appendChild(checkbox);
    container.appendChild(label);
    return container
}

function buildLegend() {
    
    let labels = data["labels"]

    var container = document.createElement('div');

    container.style.position = "absolute"
    container.style.backgroundColor = "whitesmoke"
    container.style.top = "10px"
    container.style.left = "10px"
    for (let index = 0; index < labels.length; index++) {
        const element = labels[index];
        
        container.appendChild(_buildCheckbox("Class " + element,"layer_" + element ))

    }

    let m = document.getElementById("main");
	if (m) m.appendChild(container);



}

export function init() {
	container = document.createElement("div");
	container.id = "main";
	document.body.appendChild(container);

	camera = new PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		3000
	);

	scene = new Scene();
	scene.background = new Color(0xf0f0f0);

	const light = new AmbientLight(0xffffff, 1);
	scene.add(light);

    let hist : {[k:number]: number} = {}

    for (let index = 0; index < data["labels"].length; index++) {
        const element = data["labels"][index];
        
        camera.layers.enable(element+2)
        hist[element] = 0
    }
	const geometry = new SphereBufferGeometry(4, 8, 8);
	/* const terrainObj = new THREE.Mesh(
          terrainGeo,
          new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      terrainObj.name = "terrain"
      terrainObj.rotation.x = -1.1
      scene.add(terrainObj) */

	/* var text2 : HTMLDivElement = document.createElement('div');
      text2.style.position = 'absolute';
      //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
      text2.style.width = "100";
      text2.style.height = "100";
  
      text2.innerHTML = "hi there!";
      text2.style.top = 200 + 'px';
      text2.style.left = 200 + 'px';
      document.body.appendChild(text2); */

    buildLegend()
	let meanX = 0;
	let meanY = 0;
	let meanZ = 0;
	let num = 0;
    
    let minX = 100000

	for (let i = 0; i < dataObj.length; i++) {
		let point = dataObj[i];
		const object = new Mesh(
			geometry,
			new MeshLambertMaterial({ color: ( point["label"] != -1 ? colors[point["label"]] : 0xcacaca )})
		);
        
        hist[point["label"]] += 1
        
        let wX = point["x"] * 200
        if ( wX < minX ){
            minX = wX
        }

		object.position.x = wX // Math.random() * 400
		object.position.y = point["y"] * 200;
		object.position.z = point["z"] * 200;
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

        object.layers.set(point["label"] + 2)
		scene.add(object);
	}


	meanX /= num;
	meanY /= num;
	meanZ /= num;

    

    const wallGeo = new BoxGeometry(1, 1, 1);
    const wall1 = new Mesh(
        wallGeo,
        new MeshLambertMaterial({ color: 0x000000 })
    );

    wall1.position.set(minX - 1200, meanY , meanZ - 100)

    wall1.scale.x *= 2000
    wall1.scale.y *= 2000
    scene.add(wall1)
    
    

    /* camera.position.setX(wall1.position.x) //= wall1.position
    camera.position.setY(wall1.position.y)
    camera.position.setZ(wall1.position.z - 100) */

    const fontt = new FontLoader().parse(typefaceFont)

    for (let index = 0; index < data["labels"].length; index++) {
        const element = data["labels"][index];
        
        const h = hist[element] * 0.5
        const histGeometry = new BoxGeometry(30, 1, 30);
        const object = new Mesh(
			histGeometry,
			new MeshLambertMaterial({ color: ( element != -1 ? colors[element] : 0xcacaca )})
		);
        
        object.position.set(minX - 1000 + 50 * index, meanY , meanZ )
        object.rotation.y = 0.2
        
        /* object.position.x = meanX + 4 * index;
        object.position.y = 100
        object.position.z = meanZ  */

        object.scale.y *= h
        object.translateY(h/2)

        const tGeo = new TextGeometry( hist[element].toString() , {
            font: fontt,
            size: 10,
            height: 5
        } );

        const tMat = new MeshLambertMaterial({color: 0xffffff})
        var tMesh = new Mesh( tGeo, tMat )
    
        tMesh.position.set(minX - 1015 + 50 * index, meanY , meanZ )
        tMesh.rotation.y = 0.2
        tMesh.translateY(h)

        object.layers.set(element + 2)
        tMesh.layers.set(element + 2)

        scene.add(object)
        scene.add(tMesh)
    }

	raycaster = new Raycaster();
    raycaster.layers.enableAll()
	renderer = new WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

    camera.position.x = meanX * 0.0;
	camera.position.y = meanY * 1.3;
	camera.position.z = meanZ * 2.4;
/* 
    camera.rotation.x = -0.03836148783319388 // -100 *0.0174533
    camera.rotation.y = -0.0066722240508255886 //100 *0.0174533
    camera.rotation.z = -0.00025608016552217886 //-100 *0.0174533 */

	controls = new OrbitControls(camera, renderer.domElement);
	//controls.target.set(0 , 0 , 0 );
	controls.enablePan = true;
	controls.enableDamping = false;
    controls.autoRotate = false
	controls.enableZoom = true;
	controls.zoomSpeed = 1;
	controls.panSpeed = 1;
	controls.enableRotate = true;

    controls.keyPanSpeed = 100;
    //controls.update();
    //camera.rotateY(180 * 0.0174533)
	camera.position.x = meanX * 0.0;
	camera.position.y = meanY * 1.3;
	camera.position.z = meanZ * 2.4;
/* 
    camera.rotation.x = -0.03836148783319388 // -100 *0.0174533
    camera.rotation.y = -0.0066722240508255886 //100 *0.0174533
    camera.rotation.z = -0.00025608016552217886 //-100 *0.0174533 */
    
    //camera.lookAt(wall1.position)
	

    
    
	document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("click", onMouseClick);

	window.addEventListener("resize", onWindowResize);



    /* const gui = new GUI()

    gui.add(camera.layers, "layers")
    gui.open() */
	/* const gui = new GUI()
      
      const cameraFolder = gui.addFolder('Camera')
      cameraFolder.add(camera.position, 'z', -1000, 1000, 5)
      cameraFolder.add(camera.position, 'x', -1000, 1000, 5)
      cameraFolder.add(camera.position, 'y', -1000, 1000, 5)
      cameraFolder.add(camera.rotation, 'x', -2*Math.PI,  Math.PI * 2, 0.01)
      cameraFolder.add(camera.rotation, 'y', -2*Math.PI,  Math.PI * 2, 0.01)
      cameraFolder.add(camera.rotation, 'z', -2*Math.PI,  Math.PI * 2, 0.01)
      cameraFolder.open() */
	return container;
}

let isMouseDown = false
let mouseClick = false
function onMouseDown() {
	isMouseDown = true
}
function onMouseClick(event: any) {

    
    if (mouseClick){
        
        if (!event.target.classList.contains("preview")){
            mouseClick = false
            wasOpen = false
            INTERSECTED = undefined
            let d = document.getElementById("lol");
            if (d != undefined) {
                d.remove()
            }
        }
        
    }
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar

    if (INTERSECTED != undefined && INTERSECTED.name.startsWith("#cube") ) {
        mouseClick = true
    }
}

function onMouseUp() {
	isMouseDown = false
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
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
		console.log("first time")
		imgs[obj.name] = b64;
	}

	var div = document.createElement("div");
	div.style.width = "400px";
	div.style.height = "430px";
	div.style.background = "white";
	div.style.color = "white";

    let img = document.createElement("img")
    img.src = `data:image/jpg;base64,${imgs[obj.name]}`
    img.width = 400
    img.height = 400
    img.classList.add("preview")
    div.appendChild(img)

    let openBtn = document.createElement("button")
    openBtn.textContent = "open"
    openBtn.type = "button"
    openBtn.classList.add("preview")
    openBtn.onclick = function (e:any) {
        e.preventDefault()
        window.shell.showItemInFolder(conf["dataset_path"] + obj.userData["img_name"])
        return false
    }
    div.appendChild(openBtn)


	/* div.innerHTML = `<img class='preview' width='400px' height='400px' src='data:image/jpg;base64,${
		imgs[obj.name]
	}'/>`; */
	div.id = "lol";
    div.classList.add("preview")
	div.style.position = "absolute";
	div.style.left = left + 20 + "px";
	div.style.top = top + "px";
	let m = document.getElementById("main");
	if (m) m.appendChild(div);
	wasOpen = true;
}

function onPointerMove(event: any) {

    if (isMouseDown || mouseClick) return
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -((event.clientY - 0) / window.innerHeight) * 2 + 1; // -40px due to navbar

    if (INTERSECTED != undefined && INTERSECTED.name.startsWith("#cube") ) {
		
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

//

export function animate() {
	requestAnimationFrame(animate);

	//controls.update();
	render();
	//stats.update();

    //console.log(camera.rotation)
}

function render() {
	//theta += 0.1;

	/* camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
    camera.lookAt(scene.position);
  
    camera.updateMatrixWorld(); */

	// find intersections

	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObjects(scene.children, false);

    try {
        
        
    
        if (intersects.length > 0) {
            
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED)
                    INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                if (intersects[0].object.name.startsWith("#cube")){
                    INTERSECTED = intersects[0].object;
                    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                    INTERSECTED.material.emissive.setHex(0xff0000);
                }
                
            }
        } else {

            if (INTERSECTED) {
                INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            }

            INTERSECTED = undefined;
        }
    } catch (error) {
            
    }
	renderer.render(scene, camera);
}
