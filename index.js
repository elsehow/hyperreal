const EE = require('events').EventEmitter
const talk = require('real-talk')

module.exports = (log, signKeypair, encryptKeypair) => {

  var emitter = new EE()

  function sign (obj) {
    return talk.signed(obj, signKeypair)
  }

  function encrypt (obj, to) {
    return talk.encrypted(obj, encryptKeypair, to)
  }

  function add (links, t, v, cb) {
    var value = {
      type: t,
      payload: v,
      encryptPublicKey: talk.serialize(encryptKeypair.publicKey),
    }
    log.add(links, value, cb)
  }

  function unserializedPk (node) {
    return talk.unserialize(node.value.encryptPublicKey)
  }

  function wrap (hyperlogCb, obj) {
    if (hyperlogCb)
      return (err, node) => {
        node.value.body = obj
        node.value.encryptPublicKey = unserializedPk(node)
        hyperlogCb(err, node)
      }
    return
  }

  function handle (node) {
    function check (v, cb) {
      if (v) {
        node.value.body = v.body
        node.value.encryptPublicKey = unserializedPk(node)
        cb(node)
      }
    }
    switch (node.value.type) {
    case 'signed':
      check(talk.verify(node.value.payload), n => {
        emitter.emit('signed', n)
      })
      break
    case 'encrypted':
      check(talk.decrypt(node.value.payload, encryptKeypair), n => {
        emitter.emit('encrypted', n)
      })
      break
    }

  }

  // setup callbacks
  log.createReadStream({live:true}).on('data', handle)

  emitter.signedMessage = (links, obj, cb) => {
    add(links,
        'signed',
        sign(obj),
        wrap(cb, obj))
  }

  emitter.encryptedMessage = (links, obj, toEncryptPubkey, cb) => {
    add(links,
        'encrypted',
        encrypt(obj, toEncryptPubkey),
        wrap(cb, obj))
  }

  // return methods
  return emitter

}

