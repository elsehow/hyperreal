const utils = require('./utils')
const halite = require('halite')


module.exports = (log, cb) => {

  // TODO
  // we should unserialize everything on read
  log.createReadStream({live:true}).on('data',cb)

  return {

    utils: utils,

    unencrypted:  (links, m, my_keypair, cb) => {
      var un = utils.unencrypted(m, halite.pk(my_keypair))
      log.add(links, un, cb)
    },

    encrypted: (links, m, my_keypair, to_pubkey, cb) => {
      var en = utils.encrypted(m, my_keypair, to_pubkey)
      log.add(links, en, cb)
    },

    decrypt: (node, my_keypair) => {
      return utils.decrypt(node.value, my_keypair)
    }

  }

}
