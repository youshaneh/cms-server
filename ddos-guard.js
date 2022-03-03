module.exports = (minInterval = 500, maxInterval = 10000) => {
  let waitUntil = {}
  return (req, res, next) => {
    const remoteAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    if (waitUntil[remoteAddress] == undefined) {
      const nextTime = Date.now() + minInterval;
      const timeoutId = setTimeout(() => {
        delete waitUntil[remoteAddress]
      }, minInterval);
      waitUntil[remoteAddress] = { nextTime, timeoutId }
      next()
    }
    else {
      const { nextTime: oldNextTime, timeoutId: oldTimeoutId } = waitUntil[remoteAddress]
      const timeElapsed = oldNextTime - Date.now()
      const penalty = Math.ceil(timeElapsed / minInterval) * minInterval
      const nextTime = oldNextTime + penalty
      if ((nextTime - Date.now()) > maxInterval) {
        res.status(429);
        res.json({ errMsg: '請求太過頻繁，請稍後再試' })
      }
      else {
        clearTimeout(oldTimeoutId)
        setTimeout(() => next(), oldNextTime - Date.now());
        const timeoutId = setTimeout(() => {
          delete waitUntil[remoteAddress]
        }, nextTime - Date.now());
        waitUntil[remoteAddress] = { nextTime, timeoutId }
      }
    }
  }
}