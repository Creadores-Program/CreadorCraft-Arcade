(function(root){
  let modules = {};
  async function requireModule (path){
    if(Object.keys(modules).indexOf(path) < 0){
      let blob = await GameProps.getFileGame().file(path).async("blob");
      modules[path] = URL.createObjectURL(blob);
    }
    const module = await import(modules[path]);
    return module;
  }
  root.requireModule = requireModule;
})((typeof window !== 'undefined') ? window : global);
