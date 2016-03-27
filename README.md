# hyperreal

encrypted, verified, pseudonymous communication over a shared hyperlog

this is a low-level library, on top of which you can build your application/domain logic

## background

there are some great solutions for [distributed architectures with persistent identities](http://ssbc.github.io/)

but, for some applications, we do not want persistent identities. compare ebay and craigslist. on ebay, we want identities to which we can ascribe reputation, etc.

on craigslist, we want pseudonymity - people are not identified (except, in this case, by their public keys) - but, we can still send them private (encrypted) messages.

check back for more application examples

## usage

```javascript
const hyperreal = require('hyperreal')
const hyperlog = require('hyperlog')
const halite = require('halite')
const memdb = require('memdb')

// let's send an encrypted message to each other
const mykeypair = halite.keypair()
// our psuedonyms are our public keys
const yourkeypair = halite.keypair()
// over a shared hyperlog
let log = hyperlog(memdb(), {
  valueEncoding: 'json',
})

// i'll make a hyperreal instance
let real = hyperreal(log, item => {
  // if i see an unencrypted post,
  if (!item.value.ciphertext) {
    // i'll get your pubkey (pseudonym)
    let pk = real.utils.unserialize(
      item.value.from_pubkey
    )
    // and encrypt a reply to you
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
    console.log(`you said "${dec.value.body.message}"`)
  }
})

// now, send me a plaintext message to get the party started
real2.unencrypted([], {
  message: 'y como te parece'
}, yourkeypair)

// > you said "muy buena onda"
```

## api

### real = hyperreal(log, cb)

`log` is a hyperlog, or hyperlog-like object

`cb(node)` is called whenever a new node appears over the hyperlog.

### real.unencrypted(links, obj, my_keypair, [cb])

post an unencrypted message to the hyperlog.

`links` is an array of posts to which the encrypted post should link ([] will append to the log).

`obj` is a javascript object

`my_keypair` is a tweetnacle keypair. your public key will be added to the log so others can address you. i recommend generating your keypair with [halite](https://www.npmjs.com/package/halite).

`cb(err, node)` is called when the post has been successfully added to the hyperlog.

### real.encrypted(links, obj, my_keypair, pubkey, [cb])

post an encrypted message to the hyperlog.

`pubkey` is the public key of the person to which you'd like to address the message. (again, a tweetnacle key).

see above for other argument definitions

## real.decrypt(node, my_keypair)

`node` is a hyperog node that's encrypted with hyperreal, to `my_keypair`.

returns a version of `node` where `node.value` is replaced with a decrypted version of the message.

## license

BSD