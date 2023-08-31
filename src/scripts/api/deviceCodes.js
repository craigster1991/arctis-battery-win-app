const deviceCodes = [
	{
    name: "SteelSeries Arctis 1 Wireless",
    vendorId: "4152",
    productId: "4787",
  },
	{
    name: "SteelSeries Arctis 1 Wireless (Xbox)",
    vendorId: "4152",
    productId: "4790",
  },
	{
    name: "SteelSeries Arctis 7 2017",
    vendorId: "4152",
    productId: "4704",
  },
  {
    name: "SteelSeries Arctis 7 2019",
    vendorId: "4152",
    productId: "4781",
  },
	{
    name: "SteelSeries Arctis 9",
    vendorId: "4152",
    productId: "4802",
  },
	{
    name: "SteelSeries Arctis 9",
    vendorId: "4152",
    productId: "4804",
  },
	{
    name: "SteelSeries Arctis Pro",
    vendorId: "4152",
    productId: "4690",
  },
	{
    name: "SteelSeries Arctis 7+ (2022)",
    vendorId: "4152",
    productId: "8718",
  },
  {
    name: "SteelSeries Arctis Nova Pro Wireless",
    vendorId: "4152",
    productId: "4832",
  },
  {
    name: "SteelSeries Arctis Nova 7",
    vendorId: "4152",
    productId: "8706",
  },
  {
    name: "SteelSeries Arctis Nova 7x",
    vendorId: "4152",
    productId: "8710",
  },
]

const getDeviceCodes = () => deviceCodes
const addDeviceCode = (device) => deviceCodes.push(device)

module.exports = {
  getDeviceCodes,
  addDeviceCode
}