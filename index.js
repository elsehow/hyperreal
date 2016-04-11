const talk = require('real-talk')

module.exports = (log, signKeypair, encryptKeypair, onSignedMessage, onEncryptedMessage) => {


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

  function handle (node) {
    function check (v, cb) {
      if (v) {
        var pk = talk.unserialize(node.value.encryptPublicKey)
        cb(v.body, pk, node)
      }
    }
    switch (node.value.type) {
    case 'signed':
      check(talk.verify(node.value.payload),
            onSignedMessage)
      break
    case 'encrypted':
      check(talk.decrypt(node.value.payload, encryptKeypair),
            onEncryptedMessage)
      break
    }

  }

  // setup callbacks
  log.createReadStream({live:true}).on('data', handle)

  // return methods
  return {

    signedMessage: (links, obj, cb) => {
      add(links,
          'signed',
          sign(obj),
          cb)
    },

    encryptedMessage: (links, obj, toEncryptPubkey, cb) => {
      add(links,
          'encrypted',
          encrypt(obj, toEncryptPubkey),
          cb)
    },

  }

}
