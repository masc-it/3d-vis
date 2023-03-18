/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

//import './index.css';

import "bootstrap/dist/css/bootstrap.min.css";

import * as scene from "./scene";
import * as scatter from "./plots/scatter";
import { getFiles, readJSONFile } from "./utils/files";
import { DataConfig } from "./utils/dataconfig";
import { Plot } from "./plots/plot";
import { Bar } from "./plots/bar";



function render(ws_path: string) {
	if (ws_path === "") {
		let e = document.createElement("h1")
		e.id = "no_ws_h1"
		e.innerHTML = "Open a Workspace pls. Data -> Open Workspace"
		document.body.appendChild(e)
		return
	}else {
		try {
			document.getElementById("no_ws_h1").remove()

		} catch (error) {
			
		}
	}

	let configs = getFiles(ws_path, ".json")
	
	console.log(`CONFIG PATH: ${ws_path}`)

	let config_objs = configs.map((c) => {
		return new DataConfig(readJSONFile(c))
	})

	renderWorld(config_objs)

}

export function renderWorld(config_objs : DataConfig[]) {

	let world = new scene.World();

	let x = 0

	for (let index = 0; index < config_objs.length; index++) {
		const dataConfig = config_objs[index];
		
		let plot : Plot

		switch (dataConfig.type) {
			case "scatter":
				plot = new scatter.ScatterPlot(
					world,
					world.scene,
					world.renderer,
					world.camera,
					world.cameraControls
				);
				break;
			case "bar":
				plot = new Bar(
					world,
					world.scene,
					world.renderer,
					world.camera,
					world.cameraControls
				);
			break;
		
			default:
				break;
		}
		if (plot == undefined){
			console.log(`Invalid config file: ${dataConfig}`)
			continue
		}
		plot.setupData(dataConfig)
		plot.init(dataConfig.position[0], dataConfig.position[1], dataConfig.position[2]);
		
		world.addObject(plot)
			
		x += 40
		//y += 5
	}

	world.focusOnObject(world.objects[0])
	world.currentObjIndex = 0

	function anim() {
		const delta = world.clock.getDelta();
		const updated = world.cameraControls.update(delta);

		requestAnimationFrame(anim);

        world.render(updated)
	}

	anim();
}

if (require.main === module) {
    console.log('hi');

	window.bridge.sendWsPath((event:any, ws_path:string) => {
		console.log(ws_path)
		render(ws_path)
	});
	
	render("")
}
