require.EJSInit = function(){
  GameProps.getFileGame().forEach(function(relativePath, file){
    if(!relativePath.endsWith(".ejs")) return;
    let subResul = require(relativePath);
    require.register(relativePath, function(module, exports, require){
      module.exports = ejs.render(subResul);
    });
  });
};
