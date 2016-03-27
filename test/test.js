'use strict';

const test = require('tape')
const hyperreal = require('../src/')
const hyperlog = require('hyperlog')
const halite = require('halite')
const memdb = require('memdb')

// let's send an encrypted message to each other
const mykeypair = halite.keypair()
const yourkeypair = halite.keypair()
const eveskeypair = halite.keypair()

// test core api ----------------------------

test('we can share a hyperlog, i can see your posts', t => {
  t.plan(2)

  // over a shared hyperlog
  let log = hyperlog(memdb(), {
    valueEncoding: 'json',
  })

  // i'll make a hyperreal instance
  let real = hyperreal(log, item => {
    if (!item.value.ciphertext) {
      // we got the post
      t.ok(item, 'i see your post')
      // get your pubkey from the message
      let pk = item.value.from_pubkey
      // i'll encrypt a reply to you
      real.encrypted([item.key], {
        message: 'muy buena onda'
      }, mykeypair, pk)
    }
  })

  // now you make a hyperreal instance
  let real2 = hyperreal(log, item => {
    // when you see something with a ciphertext, 
    if (item.value.ciphertext) {
      // see if you can decrypt it with your keypair
      var dec = real.decrypt(item, yourkeypair)
      t.deepEqual(dec.value.body.message,
                  'muy buena onda',
                  'you can decrypt a message i sent you')
    }
  })

  // send me a plaintext message to get us started
  real2.unencrypted([], {
    message: 'y como te parece'
  }, yourkeypair)

})

test('trying to decrypt something thats not for us will return null', t => {
  t.plan(2)

  // over a shared hyperlog
  let log = hyperlog(memdb(), {
    valueEncoding: 'json',
  })

  // i'll make a hyperreal instance
  let real = hyperreal(log, item => {
    if (!item.value.ciphertext) {
      // we got the post
      t.ok(item, 'i see your post')
      // get your pubkey from the message
      var pk = halite.pk(eveskeypair)
      // i'll encrypt a reply to you
      real.encrypted([item.key], {
        message: 'muy buena onda'
      }, mykeypair, pk)
    }
  })

  // now you make a hyperreal instance
  let real2 = hyperreal(log, item => {
    // when you see something with a ciphertext, 
    if (item.value.ciphertext) {
      // see if you can decrypt it with your keypair
      var dec = real.decrypt(item, yourkeypair)
      t.notOk(dec,
              'trying to decrypt something not for you returns null.')
    }
  })

  // send me a plaintext message to get us started
  real2.unencrypted([], {
    message: 'y como te parece'
  }, yourkeypair)
})
