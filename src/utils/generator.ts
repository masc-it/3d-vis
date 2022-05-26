export function createButton(id: string, text:string, onclick : (e:any) => void, style : { [k:string]: any} ) {
    
    let el = document.createElement("button")
    el.id = id
    el.textContent = text
    el.onclick = onclick
    Object.assign(el.style, style)
    return el
}