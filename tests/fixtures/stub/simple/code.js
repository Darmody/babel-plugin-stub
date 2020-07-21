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

// @stub 'stub value'
variable = 'new value';

// @stub 'stub value'
variable;

const obj = {
  // @stub 'stub value'
  property: 'value',
};

// @stub true
if (variable > 0) {
  // @stub false
} else if (variable < 0) {
}

function fn() {
  // @stub 'stub value'
  return 'value';
}

fn(
  // @stub 'stub value'
  variable,
  // @stub 'stub value'
  'value'
);
