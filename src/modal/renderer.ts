import "bootstrap/dist/css/bootstrap.min.css";
import { getFiles, readJSONFile } from "../utils/files";
import { DataConfig } from "../utils/dataconfig";
import {renderWorld} from "../renderer"
import {DBSCAN, KMEANS, OPTICS} from "density-clustering"

let wsPath: string | undefined = undefined

let selectedPlotDataPath: string | undefined

window.bridge.sendWsPath((event:any, ws_path:string) => {
	
    wsPath = ws_path

    console.log(`from modal: ${ws_path}`)

    document.getElementById("p-ws-path").innerHTML = ws_path
    document.getElementById("p-loading").style.display = "none"

    const plots = getPlots()

    let plotsSelect = document.getElementById("select-plots")

    for (let i = 0; i < plots.length; i++) {
        const plot = plots[i];
        
        const opt = document.createElement("option")
        opt.value = plot.name
        opt.innerText = plot.name
        opt.dataset.path = plot.dataJson
        
        plotsSelect.appendChild(opt)
    }
    
    plotsSelect.style.display = "block"

    plotsSelect.addEventListener("change", (event) => {
        onPlotSelected(event)
      });
});


function getPlots() {

    let scatterPlots : Array<DataConfig> = []

    let configs = getFiles(wsPath, ".json")
    for (let index = 0; index < configs.length; index++) {
		const config = configs[index];
		
		const dataConfig = new DataConfig(readJSONFile(config))
        if (dataConfig.type == "scatter") {
            scatterPlots.push(dataConfig)
        }
        
    }

    console.log(scatterPlots.length)
    return scatterPlots
}

function onPlotSelected(e: any) {
    
    let s = e.target
    let el = s.options[s.selectedIndex]
    //console.log(el)
    
    selectedPlotDataPath = el.getAttribute("data-path")
    console.log(selectedPlotDataPath)

    let [dataJson, vectors] = loadData()
    console.log("done loading data")
    let newDataJson = runClustering(dataJson, vectors)
    console.log("done clustering wtf")
    let base_path = window.path.dirname(selectedPlotDataPath)
    saveJSONToFile(newDataJson, base_path + "/clustering_test.json")
    console.log("done save wow")

    let dataConfigs = [
        new DataConfig(
            {
                "data_json": base_path + "/clustering_test.json",
                "name": "TEST",
                "type": "scatter",
                "position": [0,0,0]
            }
        )
    ]
    try {
        let canvas = document.querySelectorAll("canvas")

        for (let i = 0; i < canvas.length; i++) {
            const world = canvas[i];
            world.remove()
        }
    } catch {

    }
    renderWorld(dataConfigs)
}

function loadData() {
    const rawData = window.fs.readFileSync(selectedPlotDataPath, "utf-8");
    const dataJson = JSON.parse(rawData);

    let vectors: number[][] = []

    let features = dataJson["data"]
    for (let i = 0; i < features.length; i++) {
        const vector = features[i];
        
        vectors.push([vector["x"], vector["y"], vector["z"]])
    }
    return [dataJson, vectors]
}

function runClustering(dataJson: any, vectors: number[][]) {
    
    let features = dataJson["data"]

    var dbscan = new DBSCAN();
    // parameters: 5 - neighborhood radius, 2 - number of points in neighborhood to form a cluster
    var clusters = dbscan.run(vectors, 1, 5);

    let numLabels = clusters.length
    let labels = []
    if (dbscan.noise.length > 0) {
        numLabels += 1
        labels.push(-1)
    }

    console.log(clusters, dbscan.noise);

    for (let i = 0; i < clusters.length; i++) {
        labels.push(i)
        const idxs = clusters[i];
        
        for (let idx = 0; idx < idxs.length; idx++) {
            const el_idx = idxs[idx];
            features[el_idx]["label"] = i
        }
    }

    for (let idx = 0; idx < dbscan.noise.length; idx++) {
        const el_idx = dbscan.noise[idx];
        features[el_idx]["label"] = -1
    }

    dataJson["labels"] = labels
    dataJson["num_labels"] = numLabels

    return dataJson

}

function saveJSONToFile(jsonData:any, outFileName: string) {
    
    window.fs.writeFileSync(outFileName, JSON.stringify(jsonData, undefined, 2), 'utf8');
}