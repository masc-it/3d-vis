import {
	app,
	BrowserWindow,
	Menu,
	MenuItem,
	MenuItemConstructorOptions,
	dialog
} from "electron";
// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MODAL_WINDOW_WEBPACK_ENTRY: string;

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;

const isMac = process.platform === "darwin";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	// eslint-disable-line global-require
	app.quit();
}

let mainWindow: BrowserWindow;
let clusterWindow: BrowserWindow;

let wsPath: string | undefined = undefined
const template: (MenuItemConstructorOptions | MenuItem)[] = [
	{
		label: "File",
		submenu: [isMac ? { role: "close" } : { role: "quit" }, {role: 'toggleDevTools'}],
	},
	{
		label: "Data",
		submenu: [

			{
				label: "Open Workspace",
				click: async () => {
					let dir_obj = await dialog.showOpenDialog({ properties: ['openDirectory'] })
					if (!dir_obj.canceled) {
						wsPath = dir_obj.filePaths[0]
						mainWindow.webContents.send('sendWsPath', wsPath)
					}
				},
			},
			{
				label: "Cluster",
				click: async () => {
					
					let dir_obj = await dialog.showOpenDialog({ properties: ['openDirectory'] })
					if (dir_obj.canceled) {
						return
					}
					
					wsPath = dir_obj.filePaths[0]
					clusterWindow = new BrowserWindow({
						height: 800,
						width: 1200,
						parent: mainWindow,
						webPreferences: {
							preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
							nodeIntegration: true,
							devTools: true,
							webSecurity: true,
						},
					});
					clusterWindow.setMenu(null);
					clusterWindow.loadURL(MODAL_WINDOW_WEBPACK_ENTRY);

					setTimeout(()=> {
						clusterWindow.webContents.send('sendWsPath', wsPath)

					}, 1000)

				},
			}
		],
	},
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
const createWindow = (): void => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 1000,
		width: 1800,
		enableLargerThanScreen: true,
		webPreferences: {
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			nodeIntegration: true,
			devTools: true,
			webSecurity: true,
		},
	});

	//mainWindow.setMenu(menu)
	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	app.quit()
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
