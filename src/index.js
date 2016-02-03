'use strict'

var identity = require('@f/identity')
var flatten = require('@f/flatten-gen')
var isGeneratorObject = require('@f/is-generator-object')
var isFunction = require('@f/is-function')

/**
 * Exports
 */

module.exports = compose

/**
 * compose
 */

function compose (middleware) {
  return function * (action, next, ctx) {
    if (!ctx && !isFunction(next)) {
      ctx = next
      next = undefined
    }
    next = next || identity

    let idx = -1
    let res = dispatch(0)

    if (isGeneratorObject(res)) {
      return yield * flatten(res, true)()
    } else {
      return res
    }

    function dispatch (i) {
      if (i <= idx) throw new Error('next() called multiple times')
      idx = i
      const fn = middleware[i] || next
      if (!fn) return
      else {
        return fn(action, function () {
          return dispatch(i + 1)
        }, ctx)
      }
    }
  }
}
