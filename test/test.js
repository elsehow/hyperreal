'use strict';

const test = require('tape')
const hyperreal = require('..')
const keys = require('../keys')
const hyperlog = require('hyperlog')
const memdb = require('memdb')

// let's send an encrypted message to each other
const myEncKeypair    = keys.encryptKeypair()
const mySignKeypair   = keys.signKeypair()
const yourEncKeypair  = keys.encryptKeypair()
const yourSignKeypair = keys.signKeypair()

// over a shared hyperlog
let log = hyperlog(memdb(), {
  valueEncoding: 'json',
})

var call     = {como: 'te parece'}
var response = {buena: 'onda'}

// test core api ----------------------------

test('verified call / encrypted response', t => {
  t.plan(8)

  // i'll make a hyperreal instance
  let real  = hyperreal(
    log,
    mySignKeypair,
    myEncKeypair,
    // signed message callback
    (message, encryptPk, node) => {
      // when i see a signed message
      t.ok(message, 'we got a signed message')
      t.deepEqual(typeof encryptPk, 'object', 'public key is an object')
      // i'll send an encrypted message in reply
      real.encryptedMessage([node.key], response, encryptPk, (err, res) => {
        t.notOk(err, 'no error on add')
        t.ok(res, 'we sent the message')
      })
    }, (message) => {
      t.notOk(message, 'should NOT see encryption callback for a message that wasnt addressed to us')
  })
  // and you make a hyperreal instance
  let real2 = hyperreal(
    log,
    yourSignKeypair,
    yourEncKeypair,
    // signed message callback
    (message, encryptPk, node) => {
      t.ok(message, 'a verified message in real2')
    // encrypted message cb
    }, (message, encryptPk, node) => {
      t.ok(message, 'a message comes through')
      t.deepEqual(message, response, 'response should be my response')
      t.deepEqual(encryptPk, myEncKeypair.publicKey, 'public key should be my public key')
  })

  // kick it all off by sending a signed message from real2
  real2.signedMessage(null, call)

})
