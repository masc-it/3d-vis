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

function renderWorld() {
	let world = new scene.World();

	let configs = getFiles("./configs/", ".json")

	let x = 0
	let y = 0

	for (let index = 0; index < configs.length; index++) {
		const config = configs[index];
		

		let scatterPlot = new scatter.ScatterPlot(
			world.scene,
			world.renderer,
			world.camera,
			world.cameraControls
		);
		scatterPlot.setupData(new DataConfig(readJSONFile(config)))
		scatterPlot.init(x,y,5);
		
		world.addObject(scatterPlot)
		if ( index == 0)
			world.cameraControls.fitToBox(scatterPlot.pointsGroup, true,{
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 2,
                paddingBottom: 2
            })

		x += 40
		//y += 5
	}

	
	


	function anim() {
		const delta = world.clock.getDelta();
		const updated = world.cameraControls.update(delta);

		// if ( elapsed > 30 ) { return; }

		requestAnimationFrame(anim);

        world.render(updated)
        
		//scatterPlot.render();
		//world.renderer.render(world.scene, world.camera);
		/* if ( updated ) {

        data.renderer.render( data.scene, data.camera );
        //console.log( 'rendered' );

	} */
	}

	anim();
}

renderWorld()