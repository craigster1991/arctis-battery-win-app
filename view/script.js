const processData = data => {
  const parsedData = JSON.parse(data)
  $('#devices .device').remove()
  parsedData.forEach((deviceData, index) => {
    const html = $(`
      <tr class="device">
        <td>${deviceData?.device}</td>
        <td>${deviceData?.error ? "❌" : "✅"}</td>
        <td>${deviceData?.battery+"%" || "❌"}</td>
        <td>${index === 0 ? "✅" : "❌"}</td>
      </tr>
    `)
    $('#devices').append(html)
  })
  // check for device errors!!
  // showToast()
  // $("#data").innerHTML = `${data.modelName}: ${data.batteryPercent}%`
  // $("#data").innerHTML = data
}

const togglePopup = () => {
  console.log("toggling popup")
  $("#popup").toggleClass("show")
}

const showNewDevices = devices => {
  console.log("got new devices")
  console.log(JSON.parse(devices))
  togglePopup()
  $("#popup .content").html(devices)
}

$(document).ready(() => {

  $("#popup .close").on("click", togglePopup)

  window.api.receive("send-battery", data => processData(data))
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