import * as EsJS from 'https://esm.run/@es-js/core';
require.EsJSInit = function(){
  GameProps.getFileGame().forEach(function(relativePath, file){
    if(!relativePath.endsWith(".esjs")) return;
    require.register(relativePath, new Function('module', 'exports', 'require', EsJS.compile(require(relativePath))));
  });
};
