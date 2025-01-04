import * as EsJS from 'https://esm.run/@es-js/core';
(function(root){
  let modules = {};
  async function requireEsJSModule (path){
    if(Object.keys(modules).indexOf(path) < 0){
      let str = await GameProps.getFileGame().file(path).async("string");
      let blob = new Blob([EsJS.compile(str)], { type: 'text/javascript' });
      modules[path] = URL.createObjectURL(blob);
    }
    const module = await import(modules[path]);
    return module;
  }
  root.requireEsJSModule = requireEsJSModule;
})((typeof window !== 'undefined') ? window : global);
