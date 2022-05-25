import { Modal } from 'bootstrap';
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

export abstract class Plot {
    scene: Scene;
    renderer: WebGLRenderer;
    camera: OrthographicCamera;
    controls: CameraControls;
    
	constructor(scene: Scene, renderer: WebGLRenderer, camera: OrthographicCamera, controls: CameraControls) {
		this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.controls = controls
	}

    init: () => void
	render : () => void
}