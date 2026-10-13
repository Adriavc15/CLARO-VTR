const r = await fetch('https://sdk.inbenta.io/km/1.42.1/inbenta-km-sdk.js')
const text = await r.text()
for (const needle of ['apikeys/', 'domain_key', 'domainKey', 'initProductApi', 'apis.inbenta', 'km/v1', 'identity']) {
  let i = 0
  let count = 0
  while ((i = text.indexOf(needle, i)) >= 0 && count < 5) {
    console.log('\n===', needle, '===')
    console.log(text.slice(Math.max(0, i - 100), i + 250))
    i += needle.length
    count++
  }
}
