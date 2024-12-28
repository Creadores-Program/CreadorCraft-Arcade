(function(root) {
	/**
	 * Load or return cached version of requested module with id 'path' or 'path/index'
	 * @param {String} path
	 * @returns {Object}
	 */
	function require (path) {
		// Convert relative path to absolute for cases where 'require' has not been resolved
		// For example, called from outside of a module
		if (!this.module && path.charAt(0) == '.') {
			path = path.slice((path.indexOf('..') === 0) ? 3 : 2);
		}
		// Find in cache
		var m = require.modules[path] || require.modules[path + '/index'];
		if (!m) {
			// Handle versioned modules when called without version number
			var p, p2, idx;
			for (var p in require.modules) {
				if ((idx = p.indexOf('#')) != -1) {
					p2 = p.slice(0, idx);
					if (path == p2) {
						m = require.modules[p];
						break;
					}
				}
			}
      //CreadorCraft Extra
      if(!m){
        async function CreadorCraftFile(){
          let data = await GameProps.getFileGame().file(path).async("string");
          if(path.endsWith(".json")){
            //save in cache
            require.modules[path] = new Function("module", "exports", "require", "module.exports = "+data+";");
          }else if(path.endsWith(".js")){
            //save in cache
            require.modules[path] = new Function("module", "exports", "require", data);
          }else{
            require.modules[path] = function(module, exports, require){ module.exports = data; };
          }
          return require.modules[path];
        }
        m = CreadorCraftFile();
        if(!m) throw "Couldn't find module for: " + path;
      }
		}
		// Instantiate the module if it's export object is not yet defined
		if (!m.exports) {
			// Convert 'lazy' evaluated string to Function
			if ('string' == typeof m) {
				m = require.modules[path] = new Function('module', 'exports', 'require', m);
			}
			m.exports = {};
			m.filename = path;
			m.call(this, m, m.exports, require.relative(path));
		}
		// Return the exports object
		return m.exports;
	}

	// Cache of module objects
	require.modules = {};

	/**
	 * Resolve 'to' an absolute path
	 * @param {String} from
	 * @param {String} to
	 * @returns {String}
	 */
	require.resolve = function (from, to) {
		var fromSegs = from.split('/')
			, seg;

		// Non relative path
		if (to.charAt(0) != '.') return to;

		// Don't strip root paths (handled specially in require())
		if (fromSegs.length > 1) fromSegs.pop();
		to = to.split('/');
		// Use 'from' path segments to resolve relative 'to' path
		for (var i = 0; i < to.length; ++i) {
			seg = to[i];
			if (seg == '..') {
				fromSegs.pop();
			} else if (seg != '.') {
				fromSegs.push(seg);
			}
		}
		return fromSegs.join('/');
	};

	/**
	 * Partial completion of the module's inner 'require' function
	 * @param {String} path
	 * @returns {Function}
	 */
	require.relative = function (path) {
		return function (p) {
			return require(require.resolve(path, p));
		};
	};

	/**
	 * Register a module with id of 'path' and callback of 'fn'
	 * @param {String} path
	 * @param {Function} fn [signature should be of type (module, exports, require)]
	 */
	require.register = function (path, fn) {
		require.modules[path] = fn;
	};

	// Expose
	root.require = require;

})((typeof window !== 'undefined') ? window : global);
