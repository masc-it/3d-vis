import * as THREE from "three";
import CameraControls from "camera-controls";
import { Plot } from "./plots/plot";
import { CustomElement } from "./plots/utils";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

CameraControls.install( { THREE: THREE } );


export class World {

    width : number
    height : number

    clock : THREE.Clock

    scene : THREE.Scene
    camera : THREE.OrthographicCamera
    renderer : THREE.WebGLRenderer
    cameraControls : CameraControls

    mainBody = document.getElementById("main")

    objects : Plot[] = []

    currentObjIndex = -1

    selectionBox: SelectionBox;
    selectionHelper: SelectionHelper;
    labelRenderer: CSS2DRenderer;

    constructor() {
        this.init()
    }

    addObject = (object: Plot) => {
        this.objects.push(object) 
    }


    render = (callRenderer:boolean) => {

        let shouldUpdate : boolean = false
        for (let index = 0; index < this.objects.length; index++) {
            const element = this.objects[index];
            element.render()
            if ( element.requestWorldUpdate){
                shouldUpdate = true 
                element.requestWorldUpdate = false
            }
                
        }
        
        if (callRenderer || shouldUpdate){
            this.refresh()
        }
            
    }

    refresh = () => {
        this.renderer.render(this.scene, this.camera);

    }

    private init = () => {
        this.width  = window.innerWidth;
        this.height = window.innerHeight;
        this.clock = new THREE.Clock();
        this.scene  = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera( this.width / - 200, this.width / 200, this.height / 200, this.height / - 200, 1, 1000 );
        this.camera.position.set( 10, 20, 600 );

        /* this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        document.body.appendChild( this.labelRenderer.domElement ); */

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( this.width, this.height );
        this.renderer.shadowMap.enabled = true;

		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild( this.renderer.domElement );

        
    
        this.cameraControls = new CameraControls( this.camera, this.renderer.domElement );

        this.scene.background = new THREE.Color(0xf0f0f0);
		const light = new THREE.AmbientLight(0xffffff, 0.5);
		this.scene.add(light);
        
        this.createSelectionUtils()

        this.renderer.render( this.scene, this.camera );
    
        this.createSettings()

        this.onWindowResize()
        this.onButtonPressed()
    }

    createSelectionUtils = () => {
        this.selectionBox = new SelectionBox(this.camera, this.scene);
		this.selectionHelper = new SelectionHelper(this.selectionBox, this.renderer, "selectBox");
    }
    private onButtonPressed() {
        document.addEventListener("keydown", (event:any) => {
            var name = event.key;
            
            if (this.currentObjIndex > -1){
                this.objects[this.currentObjIndex].resetState()
            }
                
            if (name == "ArrowRight"){
                this.currentObjIndex += 1
                
            } else if (name == "ArrowLeft") {
                this.currentObjIndex -= 1
            } else {
                return
            }

            this.currentObjIndex = this.currentObjIndex % this.objects.length
            this.objects[this.currentObjIndex].plotIsRendered = true
            this.objects[this.currentObjIndex].plotHasFocus = true
            this.cameraControls.fitToBox(this.objects[this.currentObjIndex].objectToFocus, true, {
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 2,
                paddingBottom: 2
            })
            
        })
    }

    private createSettings = () => {
    
        let buttons : HTMLElement[] = [
    
            /* GEN.createButton("controls-rotate", "Roate 45",
                (e) => {
                    cameraControls.rotate(  45 * THREE.MathUtils.DEG2RAD, 0, true )
                },
                {
                    "color": "red"
                }
            ) */
    
        ]
    
        
        if (this.mainBody){
    
            let infoDiv = document.createElement("div")
            infoDiv.classList.add("info")
    
            buttons.forEach(element => {
                infoDiv.appendChild(element)
            });
            
            this.mainBody.appendChild(infoDiv)
        }
    
    
    }

    private onWindowResize = () => {
		
        //this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

}
