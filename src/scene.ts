let configJson = window.fs.readFileSync("conf.json", "utf-8");
let conf = JSON.parse(configJson);

let rawdata = window.fs.readFileSync(conf["data_json"], "utf-8");

let data = JSON.parse(rawdata);

let dataObj = data["data"];

let sceneHtml = window.fs.readFileSync("src/scene.html", "utf-8");
//console.log(sceneHtml)
/* 
import hFont from "./Musa_Regular.json"
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json' */
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";

import { GUI } from "dat.gui";
import * as THREE from "three";
import CameraControls from "camera-controls";

import * as GEN from "./utils/generator"
import { Scene, WebGLRenderer } from "three";


CameraControls.install( { THREE: THREE } );

let width : number
let height : number

let clock : THREE.Clock

let scene : THREE.Scene
let camera : THREE.OrthographicCamera
let renderer : THREE.WebGLRenderer
let cameraControls : CameraControls
let mainBody = document.getElementById("main")

function createSettings() {
    
    let buttons = [

        GEN.createButton("controls-rotate", "Roate 45",
            (e) => {
                cameraControls.rotate(  45 * THREE.MathUtils.DEG2RAD, 0, true )
            },
            {
                "color": "red"
            }
        )

    ]

    
    if (mainBody){

        let infoDiv = document.createElement("div")
        infoDiv.classList.add("info")

        buttons.forEach(element => {
            infoDiv.appendChild(element)
        });
        
        mainBody.appendChild(infoDiv)
    }


}

export function init() {
    width  = window.innerWidth;
    height = window.innerHeight;
    clock = new THREE.Clock();
    scene  = new THREE.Scene();
    camera = new THREE.OrthographicCamera( width / - 200, width / 200, height / 200, height / - 200, 1, 1000 );
    camera.position.set( 0, 0, 600 );
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    cameraControls = new CameraControls( camera, renderer.domElement );

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry( 2, 2, 1 ),
        new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
    );
    scene.add( mesh );

    const gridHelper = new THREE.GridHelper( 500, 50 );
    gridHelper.position.y = - 1;
    scene.add( gridHelper );

    renderer.render( scene, camera );

    createSettings()
    
    return {
        "scene": scene,
        "renderer": renderer,
        "camera": camera,
        "clock": clock,
        "controls": cameraControls
    }
}
