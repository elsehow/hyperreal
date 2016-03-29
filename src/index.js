const talk = require('real-talk')
const halite = require('halite')

module.exports = (log, cb) => {

  // TODO we could unserialize everything on read
  log.createReadStream({live:true}).on('data', node => {
    node.value = talk.parse(node.value)
    cb(node)
  })

  return {

    unencrypted:  (links, obj, my_keypair, cb) => {
      var un = talk.unencrypted(obj, my_keypair)
      log.add(links, talk.stringify(un), cb)
    },

    encrypted: (links, obj, my_keypair, to_pubkey, cb) => {
      var en = talk.encrypted(obj, my_keypair, to_pubkey)
      log.add(links, talk.stringify(en), cb)
    },

    decrypt: (node, my_keypair) => {
      try {
        node.value = talk.decrypt(node.value, my_keypair)
        return node
      } catch (e) {
        return null
      }
    }
  }
}
