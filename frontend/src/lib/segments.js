/** Client-side segment/encoding calculation (mirrors the server helper). */
export function calcLocal(text) {
  const t = text || ''
  const gsm = /^[A-Za-z0-9 @£$¥èéùìòÇØøÅåÆæßÉ!\"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà{}\[\]~^|\\]*$/
  const isGsm = gsm.test(t)
  const per = t.length <= (isGsm ? 160 : 70) ? (isGsm ? 160 : 70) : (isGsm ? 153 : 67)
  const single = isGsm ? 160 : 70
  const multi = isGsm ? 153 : 67
  const segs = t.length <= single ? 1 : Math.ceil(t.length / multi)
  return { chars: t.length, segments: segs, encoding: isGsm ? 'GSM-7' : 'UCS-2', per: t.length <= single ? single : multi }
}
