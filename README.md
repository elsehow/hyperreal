# hyperreal

verified & encrypted 1:1 communication over a hyperlog

[![Build Status](https://travis-ci.org/elsehow/hyperreal.svg?branch=master)](https://travis-ci.org/elsehow/hyperreal)

## install
```
npm install hyperreal
```

## use

```javascript
'use strict';

const hyperreal = require('hyperreal')
const keys = require('hyperreal/keys')
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
```

## background
there are some great solutions for [distributed architectures with persistent identities](http://ssbc.github.io/)

but, for some applications, we do not want persistent identities. compare ebay and craigslist. on ebay, we want identities to which we can ascribe reputation, etc.

on craigslist, we want pseudonymity - people are not identified (except, in this case, by their public keys) - but, we can still send them private (encrypted) messages.

check back for more application examples
## api
### var keys = require('hyperreal/keys')
#### keys.signKeypair()
generate a new signing keypair
#### keys.encryptKeypair()
generate a new encryption keypair
### var real = hyperreal(log, signKeypair, encryptKeypair)

`log` is a hyperlog

`signKeypair` is a keypair generated from `talk.signKeypair()`

`encryptKeypair` is a keypair generated from `talk.encryptKeypair()`

### real.on('signed', cb)
`cb(node)` is called when a message encrypted to your `encryptKeypair.publicKey` comes in over the hyperlog. **use to learn about new encryption keys from others.**

- `node.value.body` is the (verified) message (an object)

- `node.value.encryptPublicKey` is the `encryptKeypair.publicKey` of the party that *sent* the message

- `node` is the original hyperlog node that came over the wire (with relevant fields in cleartext)

### real.on('encrypted', cb)
`cb(node)` is called when a message, *encrypted to you*, comes in over the hyperlog.

- `node.value.body` is the (decrypted) message (an object)

- `node.value.encryptPublicKey` is the `encryptKeypair.publicKey` of the party that *sent* the message

- `node` is the original hyperlog node that came over the wire (with relevant fields in cleartext)

### real.signedMessage (links, obj, cb)
    
sign object `obj` and `encryptPubkey` with your `signKeypair`

`cb` wraps hyperlog's `log.add` callback

**use this to introduce your `encryptKeypair.publicKey`, so people can send you encrypted messages.**

### real.encryptedMessage (links, obj, toPubkey, cb)

encrypt object `obj` to `toPubkey` with our `encryptKeypair`

`cb` wraps hyperlog's `log.add` callback

## license
BSD
