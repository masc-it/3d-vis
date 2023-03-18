
export { }

declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import('fs')
    os: typeof import('os')
    shell: typeof import('shell')
    path: typeof import("path")
    ipcRenderer: import('electron').IpcRenderer
    bridge: any
    removeLoading: () => void
  }
}