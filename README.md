# hyperreal

encrypted, verified, pseudonymous communication over a shared hyperlog

this is a low-level library, designed to build domin logic ontop of

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