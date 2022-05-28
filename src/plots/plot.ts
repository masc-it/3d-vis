import {
    Object3D,
	OrthographicCamera,
	Scene,
	WebGLRenderer,
} from "three";

import CameraControls from "camera-controls";

export abstract class Plot {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: OrthographicCamera;
    controls: CameraControls;
    
	requestWorldUpdate : boolean = false

    objectToFocus : Object3D

	constructor(scene: Scene, renderer: WebGLRenderer, camera: OrthographicCamera, controls: CameraControls) {
		this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.controls = controls
	}

    init: (x: number, y: number, z: number) => void
    setupData : (dataJson : {[k:string]: any}) => void
	render : () => void
}