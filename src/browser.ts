// Basic Browser support.
// Please just use a bundler and import index.ts instead of this file.
// @ts-nocheck
(()=>{
  const metatablejs = require('./index');
  window.metatablejs = metatablejs;
  return metatablejs;
})();
