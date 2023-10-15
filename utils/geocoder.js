import NodeGeocoder from 'node-geocoder'

const options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: 'SX4M3zi6w6ejWVSbTH5RlmtbaCAtRByX',
  formatter: null,
}

const geocoder = NodeGeocoder(options)

export default geocoder
