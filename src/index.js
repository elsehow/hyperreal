const utils = require('./utils')

module.exports = (log, cb) => {

  log
    .createReadStream({live: true})
    .on('data', cb)

  return {

    // append to log a plaintext post m
    // identified by your pk
    post:  (m, pk, cb) => {
      pk = Array.apply(null, new Uint8Array(pk))
      log.append(
        utils.post(m, pk),
        cb)
    },

    // reply to post `p` with message `m`
    // it will be encrypted to the sender of `p`
    // and signed with your keypair `kp`
    // TODO destructuring
    reply: (p, kp, m, cb) => {
      var pk = new Uint8Array(p.value.pubkey)
      var r = utils.reply(p.key, pk, kp, m)
      log.add(p.key, r, cb)
    },

    // decrypt reply `r`
    // with keypair `kp`
    decrypt: (r, kp) => {
    }

  }

}
