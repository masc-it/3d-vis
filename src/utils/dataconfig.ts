export class DataConfig {
    name: string
    dataJson: string
    type: string 
    position: number[]
    
    constructor(obj: {[k:string]:any}) {
        this.name = obj["name"]
        this.dataJson = obj["data_json"]
        this.type = obj["type"]
        this.position = obj["position"]
    }
}