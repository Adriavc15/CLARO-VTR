const r = await fetch('https://sdk.inbenta.io/km/1.42.1/inbenta-km-sdk.js')
const text = await r.text()
for (const needle of ['apikeys', 'domainKey', 'fromDomainKey', '/v1/', 'authorization', 'x-inbenta', 'accessToken', 'contents/']) {
  let i = 0
  let count = 0
  while ((i = text.indexOf(needle, i)) >= 0 && count < 3) {
    console.log('\n===', needle, i, '===')
    console.log(text.slice(Math.max(0, i - 60), i + 180))
    i += needle.length
    count++
  }
}
