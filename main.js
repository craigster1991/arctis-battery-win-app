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
    width: 800,
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
  // win.webContents.openDevTools()
  win.on("minimize", e => {
    e.preventDefault()
    win.hide()
  })

  ipcMain.on("get-devices", () => {
    console.log("get-devices!")
    const rawDevices = getUnmatchedDevices()
    let temp = {}
    const cleanDevices = rawDevices
    .map(d => {
      const { vendorId, productId, product, ...rest } = d.attDevice
      return { vendorId, productId, product }
    })
    .filter((device => {
      if (device?.vendorId === temp?.vendorId && device?.productId === temp?.productId && device?.product === temp?.product) {
        return false
      }
      temp = device
      return true
    }))
    win.webContents.send("get-devices", JSON.stringify(cleanDevices))
  })

  ipcMain.on("get-battery", () => {
    let devicesData = {}
    try {
      devicesData = getMatchedBatteryLevels()
    }
    catch (e) {
      console.log(e);
      devicesData = e
    }
    if (!devicesData[0]?.battery) {
      tray.setImage(path.join(__dirname, `icons/disconnect.png`))
    }
    else {
      //math.min stops any values over 100
      tray.setImage(path.join(__dirname, `icons/${Math.min(devicesData[0]?.battery, 100)}.png`))
    }
    win.webContents.send("send-battery", JSON.stringify(devicesData))
  })
}

app.on("ready", init)
