const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron")
const path = require("path")
const getHeadphones = require('arctis-usb-finder').default

let win, tray
async function init() {
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    { label: 'Quit', click: () => {
      app.isQuiting = true
      app.quit()
    }},
  ])
  tray = new Tray(path.join(__dirname, "icons/disconnect.png"))
  tray.setToolTip('Arctis Headset Battery.')
  tray.setContextMenu(contextMenu)

  win = new BrowserWindow({
    width: 800,
    height: 600,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js")
    }
  })
  win.webContents.openDevTools()
  win.hide()
  win.setMenu(null)
  win.loadFile(path.join(__dirname, "index.html"))
  win.on('minimize', e => {
    e.preventDefault()
    win.hide()
  })

  ipcMain.on("get-battery", () => {
    let headphonesData = {}
    try { headphonesData = getHeadphones()[0] } // only want first headphone found
    catch (e) { return }
    if (!headphonesData.batteryPercent) {
      tray.setImage(path.join(__dirname, `icons/disconnect.png`))
    }
    else {
      // math.min stops any values over 100
      tray.setImage(path.join(__dirname, `icons/${Math.min(headphonesData.batteryPercent, 100)}.png`))
    }
    win.webContents.send("send-battery", headphonesData)
  })
}

app.on("ready", init)