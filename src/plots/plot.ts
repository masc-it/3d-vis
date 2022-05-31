import {
    Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";

import CameraControls from "camera-controls";
import { DataConfig } from "../utils/dataconfig";
import { World } from "../scene";

export abstract class Plot {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    controls: CameraControls;

    // keeps track of plot visibility
    plotHasFocus = false

    // keep track of plot interaction state, whether is ON or OFF (TODO refactor)
    plotIsRendered = false
	requestWorldUpdate : boolean = false

    objectToFocus : Object3D
    x: number
    y: number
    z: number
    world: World;

	constructor(world: World, scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, controls: CameraControls) {
		this.world = world
        this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.controls = controls
	}

    init: (x: number, y: number, z: number) => void
    setupData : (dataConfig : DataConfig) => void
	render : () => void
    resetState : () => void
}