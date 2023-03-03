const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');
const { getUnmatchedDevices, getMatchedBatteryLevels } = require('./scripts/api/device');

// for creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let tray,win // global for accessing in events

const createTray = () => {
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => win.show() },
    { label: "Quit", click: () => { app.quit() }},
  ])
  tray = new Tray(path.join(__dirname, "icons", "disconnect.png"))
  tray.setToolTip("SteelSeries devices battery.")
  tray.setContextMenu(contextMenu)
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  win.webContents.openDevTools();
};

app.on('ready', () => {
  createTray()
  createWindow()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

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