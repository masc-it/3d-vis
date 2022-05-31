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

function renderWorld() {
	let world = new scene.World();

	let configs = getFiles("./configs/", ".json")

	let x = 0

	for (let index = 0; index < configs.length; index++) {
		const config = configs[index];
		
		const dataConfig = new DataConfig(readJSONFile(config))

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
			console.log(`Invalid config file: ${config}`)
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

renderWorld()