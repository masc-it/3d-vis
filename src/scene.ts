import * as THREE from "three";
import CameraControls from "camera-controls";
import { Plot } from "./plots/plot";

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
        this.camera.position.set( 0, 0, 600 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( this.width, this.height );
        document.body.appendChild( this.renderer.domElement );
    
        this.cameraControls = new CameraControls( this.camera, this.renderer.domElement );
    
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry( 2, 2, 1 ),
            new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
        );
        this.scene.add( mesh );
    
        const gridHelper = new THREE.GridHelper( 500, 50 );
        gridHelper.position.y = - 1;
        this.scene.add( gridHelper );

        this.scene.background = new THREE.Color(0xf0f0f0);
		const light = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(light);
    
        this.renderer.render( this.scene, this.camera );
    
        this.createSettings()

        this.onWindowResize()
        
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
