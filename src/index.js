'use strict'

var identity = require('@f/identity')
var flatten = require('@f/flatten-gen')
var isGeneratorObject = require('@f/is-generator-object')
var isFunction = require('@f/is-function')
var toGenerator = require('@f/to-generator')

/**
 * Exports
 */

module.exports = compose

/**
 * compose
 */

function compose (middleware) {
  return function (action, next, ctx) {
    if (!ctx && !isFunction(next)) {
      ctx = next
      next = undefined
    }
    next = next || identity

    let idx = -1
    return dispatch(0)

    function dispatch (i) {
      if (i <= idx) throw new Error('next() called multiple times')
      idx = i
      const fn = middleware[i] || next
      if (!fn) return
      else {
        return tailGen(fn(action, function () {
          return dispatch(i + 1)
        }, ctx))
      }
    }
  }
}

/**
 * Tail a generator. If a generator returns a generator, compose them.
 * @param  {GeneratorObject} it
 * @return {GeneratorObject}
 */

function tailGen (it) {
  if (!isGeneratorObject(it)) return it
  return toGenerator(function () {
    this.next = next
    this.throw = error

    function next (arg) {
      return tail(it.next(arg))
    }

    function error (err) {
      return tail(it.throw(err))
    }

    function tail(n) {
      if (n.done && n.value && isGeneratorObject(n.value)) {
        it = n.value
        return {done: false, value: it.next().value}
      } else {
        return n
      }
    }
  })()
}
