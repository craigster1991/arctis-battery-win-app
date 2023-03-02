const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron")
const path = require("path")
const { getMatchedBatteryLevels, getUnmatchedDevices } = require("./api/device");

let win, tray
async function init() {
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => win.show() },
    { label: "Quit", click: () => {
      app.isQuiting = true
      app.quit()
    }},
  ])
  tray = new Tray(path.join(__dirname, "icons", "disconnect.png"))
  tray.setToolTip("SteelSeries devices battery.")
  tray.setContextMenu(contextMenu)

  win = new BrowserWindow({
    width: 1024,
    height: 800,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "api", "preload.js"),
      devTools: true
    }
  })
  // win.hide()
  win.setMenu(null)
  win.loadFile(path.join(__dirname, "view", "index.html"))
  win.webContents.openDevTools()
  win.on("minimize", e => {
    e.preventDefault()
    win.hide()
  })

  ipcMain.on("get-devices", () => {
    console.log("get-devices!")
    try {
      const rawDevices = getUnmatchedDevices()
      let temp = {}
      const cleanDevices = rawDevices
      .map(d => {
        const { vendorId, productId, product, ...rest } = d.attDevice
        return { vendorId, productId, product }
      })
      .sort((a, b) => a.productId - b.productId)
      .filter((device => {
        if (device?.vendorId === temp?.vendorId && device?.productId === temp?.productId && device?.product === temp?.product) {
          return false
        }
        temp = device
        return true
      }))
      win.webContents.send("get-devices", JSON.stringify({ error: null, cleanDevices }))
    }
    catch (e) {
      console.log(e)
      win.webContents.send("get-devices", JSON.stringify({ error: e, cleanDevices:[] }))
    }
  })

  ipcMain.on("get-battery", () => {
    let devicesData = []
    let deviceError = null
    try {
      const { error, devices } = getMatchedBatteryLevels()
      deviceError = error
      devicesData = devices

      if (devicesData.length) {
        if (!devicesData[0]?.battery) {
          tray.setImage(path.join(__dirname, `icons/disconnect.png`))
        }
        else {
          tray.setImage(path.join(__dirname, `icons/${Math.min(devicesData[0]?.battery, 100)}.png`))
        }
      }

      win.webContents.send("send-battery", JSON.stringify({ error: deviceError, devicesData }))
    }
    catch (e) {
      console.log(e);
      win.webContents.send("send-battery", JSON.stringify({ error: {e,deviceError}, devicesData }))
    }
    
  })
}

app.on("ready", init)
