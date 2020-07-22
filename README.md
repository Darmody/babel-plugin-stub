# babel-plugin-stub

> a babel plugin help you stubbing code easily (usually when you test/debug it) without modify the source code.

## Install

Using npm:

```bash
npm install --save-dev babel-plugin-stub
```

or using yarn:

```bash
yarn add babel-plugin-stub --dev
```

## Usage

### Configuration

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);

  return {
    // recommend using environment variable to apply plugin as your need.
    plugins: [process.env.STUB && 'stub'].filter(i => i),
  };
};
```

### Variable

```js
// @stub 'string'
let string = 'value';
// @stub 1
let number = 'value';
// @stub undefined
let undef = 'value';
// @stub null
let nil = 'value';
// @stub true
let truly = 'value';
// @stub false
let falsy = 'value';
```

turns into

```js
let string = 'string';
let number = 1;
let undef = undefined;
let nil = null;
let truly = true;
let falsy = false;
```

### Object Property

```js
const obj = {
  // @stub 'stub value'
  property: 'value',
};
```

turns into

```js
const obj = {
  property: 'stub value',
};
```

### Conditional Statement

```js
// @stub true
if (variable > 0) {
  // @stub false
} else if (variable < 0) {
}
```

turns into

```js
if (true) {
} else if (false) {
}
```

### Return Statement

```js
function fn() {
  // @stub 'stub value'
  return 'value';
}
```

turns into

```js
function fn() {
  return 'stub value';
}
```

## Function Arguments

```js
fn(
  // @stub 'stub value'
  variable,
  // @stub 'stub value'
  'value'
);
```

turns into

```js
fn(
  'stub value',
  'stub value,
)
```
