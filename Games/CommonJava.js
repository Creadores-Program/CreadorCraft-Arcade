require.JavaInit = async function(){
  await cheerpjInit();
  await GameProps.getFileGame().forEach(async function(rela, file){
    if(!rela.endsWith(".jar")) return;
    let BSfile = require(rela);
    if(typeof BSfile == "string"){
      BSfile = new Blob([BSfile], { type: 'application/java-archive'});
    }
    let url = URL.createObjectURL(BSfile);
    let libJ = await cheerpjRunLibrary(url);
    require.register(rela, function(module){
      module.exports = libJ;
    });
  });
};
