// Basic Browser support.
// Please just use a bundler and import index.ts instead of this file.
(()=>{
  const metatablejs = require('./index');
  window.metatablejs = metatablejs;
  return metatablejs;
})();