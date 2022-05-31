
export function readJSONFile(path: string) {

    let f = window.fs.readFileSync(path, "utf-8")
    return JSON.parse(f)
    
}

export function getFiles(basePath:string, ext: string) {
    
    let filesInDir = window.fs.readdirSync(basePath)
    return filesInDir.filter(file => file.endsWith(ext)).map(file => window.path.join(basePath, file))
}