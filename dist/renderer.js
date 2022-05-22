"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
require("./index.css");
var fs_1 = __importDefault(require("fs"));
var rawdata = fs_1["default"].readFileSync("D:\\Projects\\nodejs\\electrontest\\data.json", "utf-8");
var dataObj = JSON.parse(rawdata);
console.log(dataObj);
fs_1["default"].writeFileSync("D:\\Projects\\nodejs\\electrontest\\log.json", rawdata);
console.log('👋 This message is being logged by "renderer.js", included via webpack');
//# sourceMappingURL=renderer.js.map