import { getFiles, readJSONFile } from "../utils/files";
import { DataConfig } from "../utils/dataconfig";
import {renderWorld} from "../renderer"
import {DBSCAN, KMEANS, OPTICS} from "density-clustering"

let wsPath: string | undefined = undefined

let selectedPlot: DataConfig

let plots : DataConfig[]

let clusteringMethod : "dbscan" | "kmeans" | "optics"

window.bridge.sendWsPath((event:any, ws_path:string) => {
	
    wsPath = ws_path

    console.log(`from modal: ${ws_path}`)

    document.getElementById("p-ws-path").innerHTML = ws_path
    document.getElementById("p-loading").style.display = "none"

    plots = getPlots()

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
    
    selectedPlot = plots[s.selectedIndex]
    console.log(selectedPlot.dataJson)

    previewData(selectedPlot)

}

function loadData() {
    const rawData = window.fs.readFileSync(selectedPlot.dataJson, "utf-8");
    const dataJson = JSON.parse(rawData);

    let vectors: number[][] = []

    let features = dataJson["data"]
    for (let i = 0; i < features.length; i++) {
        const vector = features[i];
        vectors.push([vector["x"], vector["y"], vector["z"]])
    }
    return [dataJson, vectors]
}

function runClusteringDBScan(dataJson: any, vectors: number[][], neighborhoodRadius: number,
    minPointsPerCluster: number) {
    
    let features = dataJson["data"]

    var dbscan = new DBSCAN();

    // parameters: 5 - neighborhood radius, 2 - number of points in neighborhood to form a cluster
    var clusters = dbscan.run(vectors, neighborhoodRadius, minPointsPerCluster); // 1 5

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

function runClusteringOptics(dataJson: any, vectors: number[][], neighborhoodRadius: number,
    minPointsPerCluster: number) {
    
    let features = dataJson["data"]

    var dbscan = new OPTICS();

    var clusters = dbscan.run(vectors, neighborhoodRadius, minPointsPerCluster);

    let numLabels = clusters.length
    let labels = []

    console.log(clusters);

    for (let i = 0; i < clusters.length; i++) {
        labels.push(i)
        const idxs = clusters[i];
        
        for (let idx = 0; idx < idxs.length; idx++) {
            const el_idx = idxs[idx];
            features[el_idx]["label"] = i
        }
    }

    dataJson["labels"] = labels
    dataJson["num_labels"] = numLabels

    return dataJson

}
function runClusteringKMeans(dataJson: any, vectors: number[][], numClusters: number) {
    
    let features = dataJson["data"]

    var kmeans = new KMEANS();

    var clusters = kmeans.run(vectors, numClusters);

    let numLabels = clusters.length
    let labels = []

    console.log(clusters);

    for (let i = 0; i < clusters.length; i++) {
        labels.push(i)
        const idxs = clusters[i];
        
        for (let idx = 0; idx < idxs.length; idx++) {
            const el_idx = idxs[idx];
            features[el_idx]["label"] = i
        }
    }

    dataJson["labels"] = labels
    dataJson["num_labels"] = numLabels

    return dataJson

}

function saveJSONToFile(jsonData:any, outFileName: string) {
    
    window.fs.writeFileSync(outFileName, JSON.stringify(jsonData, undefined, 2), 'utf8');
}

function previewData(plot: DataConfig) {
    let dataConfigs = [
        plot
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

document.getElementById("btn-run").onclick = () => {

    let base_path = window.path.dirname(selectedPlot.dataJson)
    let [dataJson, vectors] = loadData()
    console.log("done loading data")
    
    let newDataJson 

    switch (clusteringMethod) {
        case "dbscan":
            const neighborhoodRadius = (<HTMLInputElement>document.getElementById("dbscan-neighborhoodRadius")).value
            const minPointsPerCluster = (<HTMLInputElement>document.getElementById("dbscan-minPointsPerCluster")).value
            newDataJson = runClusteringDBScan(dataJson, vectors, parseFloat(neighborhoodRadius), parseFloat(minPointsPerCluster))
            break;
        case "optics":
                const opticsNeighborhoodRadius = (<HTMLInputElement>document.getElementById("optics-neighborhoodRadius")).value
                const opticsMinPointsPerCluster = (<HTMLInputElement>document.getElementById("optics-minPointsPerCluster")).value
                newDataJson = runClusteringOptics(dataJson, vectors, parseFloat(opticsNeighborhoodRadius), parseFloat(opticsMinPointsPerCluster))
                break;
        case "kmeans":
            const numClusters = (<HTMLInputElement>document.getElementById("kmeans-clusters")).value
            newDataJson = runClusteringKMeans(dataJson, vectors, parseInt(numClusters))
            break;
        default:
            break;
    }

    console.log("done clustering wtf")
    saveJSONToFile(newDataJson, base_path + "/clustering_test.json")

    previewData(new DataConfig({
        "data_json": base_path + "/clustering_test.json",
        "name": `${clusteringMethod}`,
        "type": "scatter",
        "position": [0,0,0]
    }))
}

document.getElementById("select-clustering").onchange = (e: any) => {

    clusteringMethod = e.target.value

    let settings = document.querySelectorAll(".settings")
    for (let i = 0; i < settings.length; i++) {
        const panel: any = settings[i];
        panel.style.display = "none"
    }

    document.getElementById(`${clusteringMethod}-settings`).style.display = "block"

    
    
}