const processData = (data, tableId) => {
  $(`#${tableId} .device`).remove()
  if (!data.length) {
    const html = $(`
      <tr class="device">
        <td>No devices detected</td>
      </tr>
    `)
    $(`#${tableId}`).append(html)
  }
  else {
    data.forEach((deviceData, index) => {
      const html = 
      tableId === "devices" ? $(`
        <tr class="device">
          <td>${deviceData?.device}</td>
          <td>${deviceData?.error ? "❌" : "✅"}</td>
          <td>${deviceData?.battery+"%" || "❌"}</td>
          <td>${index === 0 ? "✅" : "❌"}</td>
        </tr>
      `) : $(`
      <tr class="device">
        <td>${deviceData?.product}</td>
        <td>${deviceData?.vendorId}</td>
        <td>${deviceData?.productId}</td>
      </tr>
    `)
      $(`#${tableId}`).append(html)
    })
  }
}

const toggleDevicePopup = () => $("#device-popup").toggleClass("show")
const toggleAboutPopup = () => $("#about-popup").toggleClass("show")

const showNewDevices = devices => {
  processData(devices, "new-devices")
  toggleDevicePopup()
}

$(document).ready(() => {

  $("#device-popup .close").on("click", toggleDevicePopup)
  $("#about-popup .close").on("click", toggleAboutPopup)
  $("#about").on("click", toggleAboutPopup)

  window.api.receive("send-battery", data => {
    const {error, devicesData} = JSON.parse(data)
    if (error) console.log("receive send-battery error", error)
    processData(devicesData, "devices")
  })
  window.api.receive("get-devices", (d) => {
    const { error, cleanDevices } = JSON.parse(d)
    if (error) return alert('error getting list of devices: '+JSON.stringify(error))
    showNewDevices(cleanDevices)
  })

  setInterval(() => {
    window.api.send("get-battery")
  }, 2000)
  window.api.send("get-battery")

  $("#new-device").on("click", e => {
    window.api.send("get-devices")
  })
})