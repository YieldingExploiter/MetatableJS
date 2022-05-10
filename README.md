<span align="center">

[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine)

# Metatable.js

Ever heard of lua metatables?

## Support Stuff

### Supported Metamethods

- [x] `__index`
- [x] `__newindex`
- [x] `__call`
- [x] `__tostring`
- [ ] `__len`

Support for any metamethods not listed above can be added via a PR, however I likely won't go out of my way to add them.

### Supported Platforms

- [x] NodeJS
- [x] Modern Browsers (&gt;=ES6 | Firefox, Chrome, Safari, Edge, Opera)
- [ ] Legacy Browsers (&lt;ES6 | IE11, Old Firefox, Old Chrome, Old Safari, Old Opera)

## Usage

Good examples can be found in the JSDocs, and some decent ones in the [tests](https://github.com/YieldingExploiter/MetatableJS/blob/main/test.js) file. However, for your convenience, here's a simple example:

</span>

```js
const { setmetatable, getmetatable } = require('metatablejs'); // installed via `pnpm i metatablejs`
const SomeTable = {
  someProp: 'someValue',
};
const SomeOtherTable = {
  someOtherProp: 'someOtherValue',
};
const MetaTabledTable = setmetatable(someTable, {
  __index: someOtherTable,
  __newindex: () => {
    throw new Error('Cannot index this meta┬─┬d ┬─┬');
  },
  __call: (_, a) => a.split('').reverse().join(''),
  __tostring: () => '[object MetaTabledTable]';
});

//
console.log(MetaTabledTable('tbc')); // => 'cbt'
//
console.log(`${MetaTabledTable}`); // => '[object MetaTabledTable]'
//
console.log(getmetatable(MetaTabledTable)); // => The metatable inputted as the 2nd arg to setmetatable()
//
console.log(MetaTabledTable.someProp); // => 'someValue'
MetaTabledTable.someProp = 'someOtherValue'; // works, since someProp exists on the pre-metatabled table
console.log(MetaTabledTable.someProp); // => 'someOtherValue'
//
console.log(MetaTabledTable.someOtherProp); // => 'someOtherValue'
MetaTabledTable.someOtherProp = 'someValue'; // Error: Cannot index this meta┬─┬d ┬─┬
```

<span align="center">

## Notice

The table passed as the first argument to every function is **not** the proxy itself, but rather the input table.

## License

### MIT License

Copyright © 2022 YieldingCoder
Copyright © 2022 MokiyCodes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

</span>
