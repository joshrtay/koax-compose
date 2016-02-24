'use strict'

/**
 * Imports
 */

var test = require('tape')
var compose = require('../src')
var flatten = require('@f/flatten-gen')
var isGeneratorObject = require('@f/is-generator-object')
var composeFns = require('@f/compose')

/**
 * Tests
 */

test('should work with one (generator)', (t) => {
  let composed = compose([
    function * (action, next) {
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

test('should have access to context', (t) => {
  let composed = compose([
    function * (action, next, ctx) {
      if (action === 'foo') return 'bar' + ctx.fetched
      else return next()
    }
  ])

  let it = composed('foo', {fetched: 'google'})
  t.equal(it.next().value, 'bargoogle')

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

  let dispatch = composed
  let it = dispatch('foo')
  let res = it.next()
  t.equal(res.value, 'bar')

  it = dispatch('qux')
  t.equal(it.next().value, 'bat')

  it = dispatch('narf')
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

  let dispatch = composed
  let it = dispatch('foo')
  t.equal(it.next().value, 'bar')

  it = dispatch('qux')
  t.equal(it.next().value, 'bat')

  it = dispatch('narf')
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

  let dispatch = composed
  let it = dispatch('foo')
  t.equal(it.next().value, 'passed woot')
  t.equal(it.next().value, 'bar')

  it = dispatch('qux')
  t.equal(it.next().value, 'passed woot')
  t.equal(it.next().value, 'passed foo')
  t.equal(it.next().value, 'bat')

  it = dispatch('narf')
  t.equal(it.next().value, 'passed woot')
  t.equal(it.next().value, 'passed foo')
  t.equal(it.next().value, 'passed qux')
  t.equal(it.next().value, 'narf')
  t.end()
})

test('should return foo', (t) => {
  let composed = compose([
    function (action, next) {
      return next()
    },
    function (action, next) {
      return next()
    },
    function (action, next) {
      return 'foo'
    }
  ])

  let it = composed()
  let res = it.next()
  t.equal(res.value, 'foo')
  t.end()


})

test('should iterate right number of times', (t) => {
  let composed = compose([
    function * (action, next) {
      return next()
    },
    function * (action, next) {
      return next()
    },
    function * (action, next) {
      return 'foo'
    }
  ])

  let dispatch = composed
  let it = dispatch()
  let res = it.next()
  t.equal(res.value, 'foo')
  t.equal(res.done, false)

  res = it.next()
  t.equal(res.value, undefined)
  t.equal(res.done, true)
  t.end()


})

test('should finish yielding on return', (t) => {
  t.plan(5)
  let composed = compose([
    function * (action, next) {
      if (action === 'fetch') return yield Promise.resolve('google')
      return next()
    },
    function * (action, next) {
      if (action === 'foo') return 'foo ' + (yield 'fetch')
      return 'qux'
    }
  ])

  let dispatch = composed
  let it = dispatch('foo')
  let res = it.next()
  t.equal(res.value, 'fetch')
  t.equal(res.done, false)

  res = it.next('google')
  t.equal(res.value, 'foo google')
  t.equal(res.done, true)


  it = dispatch('fetch')
  it.next().value.then(function (res) {
    t.equal(res, 'google')
  })
})
