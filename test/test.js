'use strict';

const test = require('tape')
const hyperreal = require('../src/')
const hyperlog = require('hyperlog')
const halite = require('halite')
const memdb = require('memdb')

// let's send an encrypted message to each other
const mykeypair = halite.keypair()
const yourkeypair = halite.keypair()

// test utils -------------------------------
require('./utils.js')()


// test core api ----------------------------

//// TODO test callbacks
//test('i see my own posts in the hyperreal callback', t => {
//  t.plan(1)
//
//  // over a shared hyperlog
//  let log = hyperlog(memdb(), {
//    valueEncoding: 'json',
//  })
//
//  // i'll make a hyperreal instance
//  let real = hyperreal(log, item => {
//    t.ok(item, 'i see my own post')
//  })
//
//  // ok, send me a plaintext message
//  real.post({
//    message: 'y como te parece'
//  }, halite.pk(yourkeypair)) // introducing yourself with your public key
//
//})
//
//// TODO test callbacks
//test('we can share a hyperlog, i can see your posts', t => {
//  t.plan(2)
//
//  // over a shared hyperlog
//  let log = hyperlog(memdb(), {
//    valueEncoding: 'json',
//  })
//
//  // i'll make a hyperreal instance
//  let real = hyperreal(log, item => {
//    if (!item.ciphertext) {
//      t.ok(item, 'i see your post')
//      real.reply(item, mykeypair, {
//        message: 'muy buena onda'
//      })
//    }
//  })
//
//  let real2 = hyperreal(log, item => {
//    if (item.ciphertext) {
//      t.ok(item, 'i see your reply')
//    }
//  })
//
//  // ok, send me a plaintext message
//  real2.post({
//    message: 'y como te parece'
//  }, halite.pk(yourkeypair)) // introducing yourself with your public key
//
//})
//
//test('trying to decrypt something thats not for us will cb(err, null)', t => {
//  t.end()
//})
