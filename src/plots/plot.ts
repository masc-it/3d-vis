import {
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

	constructor(scene: Scene, renderer: WebGLRenderer, camera: OrthographicCamera, controls: CameraControls) {
		this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.controls = controls
	}

    init: () => void
	render : () => void
}