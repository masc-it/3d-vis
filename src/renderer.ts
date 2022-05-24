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
console.log('👋 This message is being logged by "renderer.js", included via webpack');

/* import { init, animate } from './scatter';

init()
animate() */

import 'bootstrap/dist/css/bootstrap.min.css';


import * as scene from "./scene"
import * as scatter from "./plots/scatter"

let data = scene.init()

scatter.init(data.scene, data.renderer, data.camera, data.controls)


function anim (  ) {

	const delta = data.clock.getDelta();
    const updated = data.controls.update( delta );

	// if ( elapsed > 30 ) { return; }

	requestAnimationFrame( anim );

    scatter.render()
    data.renderer.render( data.scene, data.camera );
	/* if ( updated ) {

        data.renderer.render( data.scene, data.camera );
        //console.log( 'rendered' );

	} */

}

anim()