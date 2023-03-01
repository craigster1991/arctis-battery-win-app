const processData = (data, tableId) => {
  const parsedData = JSON.parse(data)
  $(`#${tableId} .device`).remove()
  parsedData.forEach((deviceData, index) => {
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
  // check for device errors!!
  // showToast()
  // $("#data").innerHTML = `${data.modelName}: ${data.batteryPercent}%`
  // $("#data").innerHTML = data
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

  window.api.receive("send-battery", data => processData(data, "devices"))
  window.api.receive("get-devices", newDevices => showNewDevices(newDevices))

  setInterval(() => {
    window.api.send("get-battery")
  }, 2000)
  window.api.send("get-battery")

  $("#new-device").on("click", e => {
    console.log("get new devices")
    window.api.send("get-devices")
  })
})