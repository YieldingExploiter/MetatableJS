// All tests are stored here, and run by github actions in node 16, 17 and 18
class TestFailedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TestFailedError';
  }
}
const { setmetatable } = require('.');
const RawTable = {};

// __index/__newindex as functions
(()=>{
  const OurIndex = {};
  const mt = setmetatable(RawTable, {
    '__index': (_, key) => OurIndex[key],
    '__newindex': (_, key, value) => {
      OurIndex[key] = value;
    }
  });
  mt.test = 'Hi';
  if (OurIndex.test !== 'Hi')
    throw new TestFailedError('__newindex: Did not add to OurIndex (as function; __newindex did not get called)');
  console.log('__newindex: OK (as function)');
  OurIndex.test2 = 'Hello!';
  if (mt.test2 !== 'Hello!')
    throw new TestFailedError('__index: Did not return from OurIndex (as function)');
  console.log('__index: OK (as function)');
})();

// __index/__newindex as tables
(()=>{
  const OurIndex = {};
  const mt = setmetatable(RawTable, {
    '__index': OurIndex,
    '__newindex': OurIndex
  });
  mt.test = 'Hi';
  if (OurIndex.test !== 'Hi')
    throw new TestFailedError('__newindex: Did not add to OurIndex (as table)');
  console.log('__newindex: OK (as table)');
  OurIndex.test2 = 'Hello!';
  if (mt.test2 !== 'Hello!')
    throw new TestFailedError('__index: Did not return from OurIndex (as table)');
  console.log('__index: OK (as table)');
})();

// __tostring
(()=>{
  const Table = setmetatable(RawTable, { '__tostring': (tbl, ...args) => '[object ToStringable]' });
  if (`${Table}` !== '[object ToStringable]')
    throw new TestFailedError('__tostring: did not return the correct value');
  else
    console.log('__tostring: OK');
})();

// __call
(()=>{
  // Ensure can call correctly
  const CallableMetatable = setmetatable(RawTable, {
    '__call': (tbl, ...args) => {
      console.log('__call: Called', tbl, 'using', args.join(', '));
      return 'Success';
    }
  });
  if (CallableMetatable('Hello', 'World') !== 'Success')
    throw new TestFailedError('__call: Did not return Success');

  // Ensure cannot call non-callable
  const NonCallableMetatable = setmetatable(RawTable, {});
  let CanCallNonCallable = false;
  try {
    NonCallableMetatable();
    CanCallNonCallable = true;
  } catch (error) {}
  if (CanCallNonCallable)
    throw new TestFailedError('__call: Non-callable metatable did not error');
  else
    console.log('__call: Non-callable metatable errored as expected');
  console.log('__call: OK');
})();
