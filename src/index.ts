export type FullMetatable = {
  /**
   * Whenever an entry does not exist in table, and gets indexed, this gets called or indexed
   * @see {@link https://www.lua.org/pil/13.4.1.html The __index Metamethod (PIL 13.4.1)}
   * @see {@link FullMetatable.__newindex __newindex} (has an example)
   */
  __index: ((table: Record<any, any>, key: any) => any) | Record<any, any>;
  /**
   * Whenever a new entry gets added to table, this gets called or indexed (if it exists; otherwise adds to the actual table)
   * @see {@link https://www.lua.org/pil/13.4.2.html The __newindex Metamethod (PIL 13.4.2)}
   * @example To make a readonly table, you can use the following:
   * ```typescript
   * const actualTable = { foo: 'bar' };
   * const readonlyTable = setmetatable({}, {
   *  __index: actualTable, // Allows you to index the actual table
   *  __newindex: ()=>{ throw new Error('Attempt to update a read-only table'); } // Prevents you from adding to the new table
   * });
   * console.log(readonlyTable.foo); // => 'bar'
   * readonlyTable.foo = 'baz'; // => Error: Attempt to update a read-only table
   * ```
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal Object.seal()} as an alternative for making objects read-only (this still has use-cases beyond that)
   */
  __newindex: ((table: Record<any, any>, key: any, value: any) => undefined | null | void) | Record<any, any>;
  /**
   * Whenever the table gets called
   * @warning If not set, calling the table will error with `Attempt to call a table value`
   * @see {@link https://www.lua.org/manual/5.4/manual.html#2.4 Metatables and Metamethods (Lua 5.4 Manual)}
   * @example ```typescript
   * const levels = { INFO: 'INFO:' };
   * const newLogger = setmetatable({levels}, {
   * __call: (table, level, message) => console.log(level, message);
   * });
   * newLogger(newLogger.levels.INFO, 'Hello World'); // => INFO: Hello World
   * ```
   */
  __call: ((table: Record<any, any>, ...args: any[]) => any);
  /**
   * Whenever the table gets converted to a string
   * @example ```typescript
   * const someTable = setmetatable({}, {
   * __tostring: ()=>{ return '[object HelloWorld]'; }
   * })
   * console.log(someTable); // => '[object HelloWorld]'
   * ```
   */
  __tostring: ((table: Record<any, any>) => string);
}
export const defaultMetatable: FullMetatable = {
  '__index': ()=>null,
  '__newindex': (table, key, value) => {
    table[key] = value;
  },
  '__call': ()=>{throw new Error('Attempt to call a table value');},
  '__tostring': ()=>'[object]',
};
export type Metatable = Partial<FullMetatable & {
  /**
   * Kept to make ts not complain if 1:1 porting a lua project
   * @warning **DO NOT USE**
   * @warning Emits a deprecation warning when present.
   * @deprecated and non-functional due to being annoying to implement
   */
  __metatable?: string;
}>;

/** @internal @description Type for the {@link setmetatable setmetatable() function} */
type TSetMetatable = (table: Record<any, any>, metatable: Metatable) => Record<any, any>;

/**
 * @description Adds the metatable to a new table
 *
 * @warning **Only the returned table is affected.** The input table does not get modified, due to the constraints of
 * (a) my lazyness, and;
 * (b) JavaScript
 *
 * @param {Record<any, any>} table The table to add the metatable to
 * @param {Metatable} metatable The {@link metatable} to add
 * @returns {Record<any, any>} The table with the metatable applied
 *
 * @see {@link getmetatable getmetatable} for getting the metatable
 * @see {@link defaultMetatable} for the defaults used
 */
export const setmetatable: TSetMetatable = (table: Record<any, any>, metatable: Metatable = defaultMetatable) => {
  // If __metatable exists, warn
  if (metatable.__metatable)
    console.warn('dep: __metatable found in metatable. It is non-functional and will throw an error if present in a future release.');
  /** Actual metatable handler */
  const proxy = new Proxy(()=>void 0, {
    // __index & __tostring
    'get': (_obj, key) => {
      // If the key is __internal_get_metatable, return the metatable
      if (key === '__internal_get_metatable')
        return metatable;
      // __tostring
      if (key === 'toString' && metatable.__tostring && typeof metatable.__tostring === 'function')
        return ()=>metatable.__tostring(table);
      // If the table directly includes key
      if (table[key as any])
        return table[key as any];
        // If index is a function
      else if (typeof metatable['__index'] === 'function')
        return metatable.__index(table, key);
        // If index is a table
      else if (typeof metatable['__index'] === 'object')
        return metatable.__index[key as any];
        // If index doesn't exist or is an invalid type
      else
        // @ts-ignore
        return defaultMetatable.__index(table, key);
    },
    // __newindex
    'set': (_obj, key, value) => {
      // If newindex is present, and the key does not exist on the table
      if (metatable['__newindex'] && typeof table[key as any] === 'undefined') {
        // If newindex is a function
        if (typeof metatable['__newindex'] === 'function')
          metatable['__newindex'](table, key, value);
        // If newindex is a table
        else if (typeof metatable['__newindex'] === 'object')
          metatable['__newindex'][key as any] = value;
      } else
        table[key as any] = value;
      return true;
    },
    // __call
    'apply': (_obj, _thisArg, args) => {
      // If call is present, and the table is callable
      if (metatable['__call'] && typeof metatable['__call'] === 'function')
        return metatable['__call'](table, ...args);
      else
        return defaultMetatable['__call'](table, ...args);
    }
  });
  return proxy;
};
/**
 * @description Gets a metatable, as defined by {@link setmetatable}.
 * If no metatable is present, returns undefined.
 * @see {@link setmetatable} for setting the metatable
 * @see {@link https://www.lua.org/manual/5.4/manual.html#2.4 Metatables and Metamethods (Lua 5.4 Manual)} for more information on metatables
 */
export const getmetatable = (table: Record<any, any>) => table['__internal_get_metatable'] ?? undefined;
