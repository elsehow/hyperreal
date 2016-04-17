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
  let real  = hyperreal(log, mySignKeypair, myEncKeypair)
  // when a signed messages comes through (e.g. from you)
  real.on('signed', node => {
    t.ok(node, 'we got a signed node')
    // its node.value.body is our message
    t.deepEqual(node.value.body, call)
    // i will reply it to it, addressing my message to that message's encryptPk 
    t.deepEqual(typeof node.value.encryptPublicKey, 'object', 'public key is an object')
    // i'll send an encrypted message in reply
    real.encryptedMessage([node.key], response, node.value.encryptPublicKey, (err, res) => {
      t.notOk(err, 'no error on add')
      t.ok(res, 'we sent the message')
    })
  })
  
  // and you make a hyperreal instance
  let real2 = hyperreal(log, yourSignKeypair, yourEncKeypair)

  // encrypted message callback
  real2.on('encrypted', node => {
      t.ok(node, 'we got a node with an encrypted value')
      t.deepEqual(node.value.body , response, 'response should be my response')
      t.deepEqual(node.value.encryptPublicKey, myEncKeypair.publicKey, 'public key should be my public key')
  })

  // kick it all off by sending a signed message from real2
  real2.signedMessage(null, call)

})
