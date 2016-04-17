'use strict';

const hyperreal = require('.')
const keys = require('./keys')
//const hyperreal = require('hyperreal')
//const keys = require('hyperreal/keys')
const hyperlog = require('hyperlog')
const memdb = require('memdb')

// let's send an encrypted message from me
const myEncKeypair    = keys.encryptKeypair()
const mySignKeypair   = keys.signKeypair()
// to you
const yourEncKeypair  = keys.encryptKeypair()
const yourSignKeypair = keys.signKeypair()
// over a shared hyperlog
let log = hyperlog(memdb(), {
  valueEncoding: 'json',
})

var call     = {como: 'te parece'}
var response = {buena: 'onda'}

// i'll make a hyperreal instance
let real  = hyperreal(log, mySignKeypair, myEncKeypair)
// when a signed messages comes through (e.g. from you)
real.on('signed', node => {
  console.log('we got a signed node')
  // its node.value.body is our message
  console.log(node.value.body)
  // i'll send an encrypted message in reply
  real.encryptedMessage([node.key], response, node.value.encryptPublicKey, (err, node) => {
    console.log('real sent an encrypted message to real2')
  })
})

// and you make a hyperreal instance
let real2 = hyperreal(log, yourSignKeypair, yourEncKeypair)

// encrypted message callback
real2.on('encrypted', node => {
  console.log('real2 decrypted a message', node.value.body)
})

// kick it all off by sending a signed message from real2
real2.signedMessage(null, call)

// > we got a signed node
// > { como: 'te parece' }
// > real sent an encrypted message to real2
// > real2 decrypted a message { buena: 'onda' }
