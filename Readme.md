
# koax-compose

[![Build status][travis-image]][travis-url]
[![Git tag][git-image]][git-url]
[![NPM version][npm-image]][npm-url]
[![Code style][standard-image]][standard-url]

Compose koax middleware.

## Installation

    $ npm install koax-compose

## Usage

```js
var compose = require('koax-compose')

var composed = compose([function * (action, next) {
  if (action === 'foo') return 'bar'
  yield 'woot'
  return next()
}, function * (action, next) {
  if (action === 'bar') return 'qux'
  yield 'narf'
  return next()
}])

composed('foo')() // => 'bar' (done)
composed('bar')() // => 'woot', 'qux' (done)
composed('dup')() // => 'woot', 'narf', 'dup' (done)
```

## API

### compose(middleware)

- `middleware` - compose the given middleware

**Returns:** a generator of the same form as the middleware

### middleware

```js
/**
 * The middleware signature
 * @param  {Mixed}   action an immutable action that middleware can process
 * @param  {Function} next  pass execution to next middleware (can yield or return)
 * @param  {Object}   ctx   mutable context (be careful)
 * @return {Mixed} whatever your heart desires
 */

function * middleware (action, next, ctx) {

}
```

## License

MIT

[travis-image]: https://img.shields.io/travis/joshrtay/koax-compose.svg?style=flat-square
[travis-url]: https://travis-ci.org/joshrtay/koax-compose
[git-image]: https://img.shields.io/github/tag/joshrtay/koax-compose.svg
[git-url]: https://github.com/joshrtay/koax-compose
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
[npm-image]: https://img.shields.io/npm/v/koax-compose.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koax-compose
