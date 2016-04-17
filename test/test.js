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
var response2= {cool:'man'}

// test core api ----------------------------

test('verified call / encrypted response', t => {
  function check (node) {
    t.ok(node, 'node exists')
    t.ok(node.value.body, 'node has a value.body')
    t.ok(node.value.encryptPublicKey, 'node has a value.encryptPublicKey')
    t.deepEqual(typeof node.value.encryptPublicKey, 'object', 'public key is an object')
  }
  // i'll make a hyperreal instance
  let real  = hyperreal(log, mySignKeypair, myEncKeypair)
  let replyKey = null
  // when a signed messages comes through (e.g. from you)
  real.on('signed', node => {
    replyKey = node.key
    // should be same node schema
    check(node)
    // its node.value.body is our message
    t.deepEqual(node.value.body, call)
    // i will reply it to it, addressing my message to that message's encryptPk 
    // i'll send an encrypted message in reply
    real.encryptedMessage([node.key], response, node.value.encryptPublicKey, (err, n) => {
      replyKey = node.key
      t.notOk(err, 'no error on add')
      // SHOULD BE SAME node schema
      check(n)
    })
  })

  // and you make a hyperreal instance
  let real2 = hyperreal(log, yourSignKeypair, yourEncKeypair)

  // encrypted message callback
  real2.on('encrypted', node => {
    check(node)
    t.deepEqual(node.value.body , response, 'response is correct')
    t.deepEqual(node.value.encryptPublicKey, myEncKeypair.publicKey, 'public key is correct')
    t.deepEqual(node.links[0], replyKey, 'this messages link[0] is to the message we sent')
    t.end()
  })

  // kick it all off by sending a signed message from real2
  real2.signedMessage(null, call)

})




test('can reply to a reply', t => {

  // i'll make a hyperreal instance
  let real     = hyperreal(log, mySignKeypair, myEncKeypair)
  let replyKey = null

  // when a signed messages comes through (e.g. from you)
  real.on('signed', node => {
    // i'll send an encrypted message in reply
    real.encryptedMessage([node.key], response, node.value.encryptPublicKey, (err, res) => {
      //console.log(res.key)
    })
  })

  // when an encrypted message fcomes through
  real.on('encrypted', node => {
    t.deepEqual(node.links[0], replyKey, 'second-order reply link[0] refers to first-order reply')
    t.end()
  })

  // and you make a hyperreal instance
  let real2 = hyperreal(log, yourSignKeypair, yourEncKeypair)

  // encrypted message callback
  real2.on('encrypted', node => {
    // reply to the encrypted message we got, addressed to its public key
    replyKey= node.key
    real2.encryptedMessage([node.key], response2, node.value.encryptPublicKey, (err, n) => {
      t.notOk(err)
      t.ok(n)
    })
  })

  // kick it all off by sending a signed message from real2
  real2.signedMessage(null, call)

})
