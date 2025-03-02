(function(root){
  let modules = {};

  function getMimeType(path) {
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".css")) return "text/css";
    return "application/octet-stream";
  }

  async function requireModule(path) {
    if (!modules.hasOwnProperty(path)) {
      let originalBlob = await GameProps.getFileGame().file(path).async("blob");
      let mime = getMimeType(path);
      // Crea un nuevo Blob con el MIME type definido
      let fixedBlob = new Blob([originalBlob], { type: mime });
      modules[path] = URL.createObjectURL(fixedBlob);
    }
    const module = await import(modules[path]);
    return module;
  }

  root.requireModule = requireModule;
})((typeof window !== 'undefined') ? window : global);
