
export function readJSONFile(path: string) {

    let f = window.fs.readFileSync(path, "utf-8")
    return JSON.parse(f)
    
}

export function getFiles(path:string, ext: string) {
    
    let filesInDir = window.fs.readdirSync(path)
    return filesInDir.filter(file => file.endsWith(ext)).map(file => path + file)
}