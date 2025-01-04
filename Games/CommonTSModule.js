(function(root){
  let modules = {};
  async function requireTSModule (path){
    if(Object.keys(modules).indexOf(path) < 0){
      let str = await GameProps.getFileGame().file(path).async("string");
      let blob = new Blob([window.ts.transpile(str, { target: window.ts.ModuleKind.ES2015 })], { type: 'text/javascript' });
      modules[path] = URL.createObjectURL(blob);
    }
    const module = await import(modules[path]);
    return module;
  }
  root.requireTSModule = requireTSModule;
})((typeof window !== 'undefined') ? window : global);
