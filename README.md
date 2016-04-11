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

// here's what you'll ask me
// (unencrypted, but signed)
const call = {como: 'te parece'}
// and here's what i'll reply
// (encrypted, just to you)
const response = {buena: 'onda'}

// i'll make a hyperreal instance for myself
let real1  = hyperreal(
  log,
  mySignKeypair,
  myEncKeypair,
  (message, encryptPk, node) => {
    // when a signed message comes in
    console.log('real1 sees a signed message')
    // i'll send an encrypted message in reply
    real1.encryptedMessage([node.key], response, encryptPk)
  // you'll never encrypt a message to me
  }, () => {
    // so this encrypted message callback
    // will not be called on my hyperreal instance
    console.log('this will never be called')
})

// now you make a hyperreal instance for yourself
let real2 = hyperreal(
  log,
  yourSignKeypair,
  yourEncKeypair,
  // signed message callback
  (message, encryptPk, node) => {
    console.log('real2 sees a signed message')
  // encrypted message cb
  }, (message, encryptPk, node) => {
    console.log('real2 sees', message)
})

// let's kick it all off by
// sending a signed message from real2
real2.signedMessage(null, call)

// > real1 sees a signed message
// > real2 sees a signed message
// > real2 sees { buena: 'onda' }
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
### var real = hyperreal(log, signKeypair, encryptKeypair, onSignedMessage, onEncryptedMessage)

`log` is a hyperlog

`signKeypair` is a keypair generated from `talk.signKeypair()`

`encryptKeypair` is a keypair generated from `talk.encryptKeypair()`

`onSignedMessage(message, encryptPublicKey, node)` is called when a message encrypted to your `encryptKeypair.publicKey` comes in over the hyperlog. **use to learn about new encryption keys from others.**

- `message` is the (verified) message (an object)

- `encryptPublicKey` is the `encryptKeypair.publicKey` of the party that *sent* the message

- `node` is the original hyperlog node that came over the wire. use this to find `node.key`.

`onEncryptedMessage(message, encryptPublicKey, node)` is called when a signed message comes in over the hyperlog

- `message` is the (decrypted) message (an object)

- `encryptPublicKey` is the `encryptKeypair.publicKey` of the party that *sent* the message

- `node` is the original hyperlog node that came over the wire. use this to find `node.key`.

### real.signedMessage (links, obj, cb)
    
sign object `obj` and `encryptPubkey` with your `signKeypair`

`cb` wraps hyperlog's `log.add` callback

**use this to introduce your `encryptKeypair.publicKey`, so people can send you encrypted messages.**

### real.encryptedMessage (links, obj, toPubkey, cb)

encrypt object `obj` to `toPubkey` with our `encryptKeypair`

`cb` wraps hyperlog's `log.add` callback

## license
BSD
