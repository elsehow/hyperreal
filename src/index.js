const utils = require('./utils')
const halite = require('halite')


module.exports = (log, cb) => {

  // TODO we could unserialize everything on read
  log.createReadStream({live:true}).on('data',cb)

  return {

    utils: utils,

    unencrypted:  (links, obj, my_keypair, cb) => {
      var un = utils.unencrypted(obj, halite.pk(my_keypair))
      log.add(links, un, cb)
    },

    encrypted: (links, obj, my_keypair, to_pubkey, cb) => {
      var en = utils.encrypted(obj, my_keypair, to_pubkey)
      log.add(links, en, cb)
    },

    decrypt: (node, my_keypair) => {
      try {
        node.value = utils.decrypt(node.value, my_keypair)
        return node
      } catch (e) {
        return null
      }
    }

  }

}
