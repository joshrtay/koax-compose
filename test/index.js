'use strict'

/**
 * Imports
 */

var test = require('tape')
var compose = require('../src')

/**
 * Tests
 */

test('should work with one (generator)', (t) => {
  let composed = compose([
    function * (action, next, ctx) {
      if (action === 'foo') return 'bar'
      else return next()
    }
  ])

  let it = composed('foo')
  t.equal(it.next().value, 'bar')

  it = composed('qux')
  t.equal(it.next().value, 'qux')
  t.end()
})

test('should work with two (mixed)', (t) => {
  let composed = compose([
    function (action, next) {
      if (action === 'foo') return 'bar'
      else {
        return next()
      }
    }, function * (action, next) {
      if (action === 'qux') return 'bat'
      else return next()
    }
  ])

  let it = composed('foo')
  t.equal(it.next().value, 'bar')

  it = composed('qux')
  t.equal(it.next().value, 'bat')

  it = composed('narf')
  t.equal(it.next().value, 'narf')
  t.end()
})

test('should work with three (generators)', (t) => {
  let composed = compose([
    function * (action, next) {
      if (action === 'woot') return 'tio'
      return next()
    },
    function * (action, next) {
      if (action === 'foo') return 'bar'
      else {
        return next()
      }
    },
    function * (action, next) {
      if (action === 'qux') return 'bat'
      else return next()
    }
  ])

  let it = composed('foo')
  t.equal(it.next().value, 'bar')

  it = composed('qux')
  t.equal(it.next().value, 'bat')

  it = composed('narf')
  t.equal(it.next().value, 'narf')
  t.end()
})

test('should yield values at arbitrary stack depths', (t) => {
  let composed = compose([
    function * (action, next) {
      if (action === 'woot') return 'tio'
      yield 'passed woot'
      return next()
    },
    function * (action, next) {
      if (action === 'foo') return 'bar'
      yield 'passed foo'
      return next()
    },
    function * (action, next) {
      if (action === 'qux') return 'bat'
      yield 'passed qux'
      return next()
    }
  ])

  let it = composed('foo')
  t.equal(it.next().value, 'passed woot')
  t.equal(it.next().value, 'bar')

  it = composed('qux')
  t.equal(it.next().value, 'passed woot')
  t.equal(it.next().value, 'passed foo')
  t.equal(it.next().value, 'bat')

  it = composed('narf')
  t.equal(it.next().value, 'passed woot')
  t.equal(it.next().value, 'passed foo')
  t.equal(it.next().value, 'passed qux')
  t.equal(it.next().value, 'narf')
  t.end()
})
