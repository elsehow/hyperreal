var test = require('tape')
var utils = require('../src/utils.js')
var halite = require('halite')

module.exports = () => {


  test('can serialize and unserialize uint8 arrays', t => {

    var kp = halite.keypair()
    // a uint8array
    var pubkey = halite.pk(kp)

    t.deepEquals(utils.unserialize(utils.serialize(pubkey)),
                 pubkey,
                 'pubkey should be equal to one thats been serialized, then unserialized'
                )
    t.end()
  })

  test('can make an unencrypted post', t => {

    var kp = halite.keypair()
    var pubkey = halite.pk(kp)

    var o = {
      title: 'hi',
      post: 'whats up',
    }

    var post = utils.unencrypted(o, pubkey)

    t.ok(post, 'post exists')

    t.deepEqual(utils.unserialize(post.from_pubkey),
                pubkey,
                '`from_pubkey` field gets assgined, and is serialized')

    t.end()

  })

  test('can make an encrypted post, and decrypt it after its been stringified', t => {

    var my_kp = halite.keypair()
    var your_kp = halite.keypair()
    var your_pubkey = halite.pk(your_kp)

    var o = {
      title: 'hi',
      message: 'whats up',
    }

    // encrypt a post
    var encrypted = utils.encrypted(o, my_kp, your_pubkey)
    // now, stringify this post + parse it again
    var serialized = JSON.stringify(encrypted)
    var unserialized = JSON.parse(serialized)
    /// decrypt it
    var decrypted = utils.decrypt(unserialized, my_kp)

    // everything should be as expected
    t.ok(decrypted.body, 'has body field')
    t.deepEqual(decrypted.body, o, 'body decrypted perfectly')
    t.deepEqual(decrypted.from_pubkey, halite.pk(my_kp), 'from_pubkey === my pk')
    t.deepEqual(decrypted.to_pubkey, your_pubkey, 'to_pubkey === your pk')
    t.end()

  })

}


