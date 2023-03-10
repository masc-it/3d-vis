import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import { shell } from 'electron';
import path from "path"
import os from "os"

//const app = require('electron').app

contextBridge.exposeInMainWorld('os', os)
contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('shell', shell)
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))

function withPrototype(obj: Record<string, any>) {
    const protos = Object.getPrototypeOf(obj)
  
    for (const [key, value] of Object.entries(protos)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) continue
  
      if (typeof value === 'function') {
        // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
        obj[key] = function (...args: any) {
          return value.call(obj, ...args)
        }
      } else {
        obj[key] = value
      }
    }
    return obj
  }