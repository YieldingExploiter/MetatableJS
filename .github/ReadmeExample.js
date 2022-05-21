const { setmetatable, getmetatable } = require('..'); // installed via `pnpm i metatablejs`
const SomeTable = {
  someProp: 'someValue',
};
const SomeOtherTable = {
  someOtherProp: 'someOtherValue',
};
const MetaTabledTable = setmetatable(SomeTable, {
  __index: SomeOtherTable,
  __newindex: () => {
    throw new Error('Cannot index this meta┬─┬d ┬─┬');
  },
  __call: (_, a) => a.split('').reverse().join(''),
  __tostring: () => '[object MetaTabledTable]',
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
let x = false;
try {
  MetaTabledTable.someOtherProp = 'someValue'; // Error: Cannot index this meta┬─┬d ┬─┬
  x = true
} catch (error) {}
if (x) throw new Error('didnt throw the metatabled table')