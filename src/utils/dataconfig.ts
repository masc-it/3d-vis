export class DataConfig {
    name: string
    dataJson: string
    datasetPath: string
    
    constructor(obj: {[k:string]:string}) {
        this.name = obj["name"]
        this.dataJson = obj["data_json"]
        this.datasetPath = obj["dataset_path"]
    }
}