const { devices: HID_devices, setDriverType: HID_setDriverType, HID } = require('node-hid')
const { getDeviceCodes } = require('./deviceCodes')

// initialise usb driver
HID_setDriverType('libusb')

const getUnmatchedDevices = (overrideMatches = null) => {
  const devices = []
  const stringMatches = overrideMatches === "_ALL_" ? "_ALL_" : (
    typeof overrideMatches === 'string' ? [overrideMatches?.toLowerCase()] : overrideMatches?.toLowerCase()
  ) || [
    "steelseries",
    "steel series",
  ]

  try {
    const attachedDevices = HID_devices()
    for (const attDevice of attachedDevices) {
      try {
        if (stringMatches === "_ALL_") {
          // if (attDevice?.usage !== 1) {
            devices.push({ attDevice })
          // }
        }
        else if (stringMatches?.some(s => attDevice?.product?.toLowerCase().includes(s) || attDevice?.manufacturer?.toLowerCase().includes(s))) {
          // if (attDevice?.usage !== 1) {
            devices.push({ attDevice })
          // }
        }
      }
      catch(e) {
        console.log('getSSDevices error', `matches:${overrideMatches}`)
        console.log(e)
      }
    }
  }
  catch(e) {
    console.log('get hid devices error', e)
    return
  }

  return devices
}

const getMatchedDevices = () => {

  const devices = []

  try {
    const attachedDevices = HID_devices()
    for (const attDevice of attachedDevices) {
  
      let kd
  
      const haveDevice = getDeviceCodes()?.some((knownDevice) => {
        try {
          const match = knownDevice?.vendorId === attDevice?.vendorId
          && knownDevice?.productId === attDevice?.productId
          && attDevice?.usage !== 1
          if (match) {
            kd = knownDevice
          }
          return match
        }
  
        catch(e) {
          console.log('knownDevice matching error', e)
          return false
        }
      })
  
      if (haveDevice) {
        devices.push({...attDevice, ...kd})
      }
    }

    return {error: null, devices}
  }
  catch(e) {
    console.log('get hid devices error', e)
    return {error: {e, s:"get hid devices error"}, devices}
  }
}

const getDevicesBattery = (devices) => {
  const parsedDevices = []

  if (devices?.length) {
    try {
      devices.forEach(d => {
        const device = new HID(d.path)
        if (!device) return
    
        try {
          
          device.write([0x06, 0x18])
          const deviceInfo = {
            device: d.name || d.product,
            battery: device.readSync()[2]
          }
    
          parsedDevices.push(deviceInfo)
    
        } catch (e) {
          console.log('connect to device fail', e)
          parsedDevices.push({
            device: deviceData.name,
            error: true
          })
        }
    
        device.close()
      });
    }
  
    catch(e) {
      console.log('error getting device battery')
      return []
    }
  }
  
  return parsedDevices
}

const getMatchedBatteryLevels = () => {
  const {error, devices} = getMatchedDevices()
  return { error, devices: getDevicesBattery(devices) }
  // return {error, devices}
}

module.exports = {
  getMatchedDevices,
  getMatchedBatteryLevels,
  getUnmatchedDevices
}