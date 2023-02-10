const deviceCodes = [
	{
    name: "SteelSeries Arctis 1 Wireless",
    vendorId: 4152,
    productId: 4787,
  },
	{
    name: "SteelSeries Arctis 7 2017",
    vendorId: 4152,
    productId: 4704,
  },
  {
    name: "SteelSeries Arctis 7 2019",
    vendorId: 4152,
    productId: 4781,
  },
	{
    name: "SteelSeries Arctis 9",
    vendorId: 4152,
    productId: 4802,
  },
	{
    name: "SteelSeries Arctis Pro",
    vendorId: 4152,
    productId: 4690,
  },
]

const getDeviceCodes = () => deviceCodes
const addDeviceCode = (device) => deviceCodes.push(device)

module.exports = {
  getDeviceCodes,
  addDeviceCode
}