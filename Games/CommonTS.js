require.TSInit = function(){
  GameProps.getFileGame().forEach(function(relativePath, file){
    if(!relativePath.endsWith(".ts")) return;
    require.register(relativePath, new Function('module', 'exports', 'require', window.ts.transpile(require(relativePath), { "target": "ES2015", "module": "CommonJS" })));
  });
};
