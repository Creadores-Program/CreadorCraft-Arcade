require.JavaInit = async function(){
  await cheerpjInit();
  for(let rela in GameProps.getFileGame().files){
    let file = GameProps.getFileGame().files[rela];
    if(!rela.endsWith(".jar")) continue;
    let BSfile = require(rela);
    if(typeof BSfile == "string"){
      BSfile = new Blob([BSfile], { type: 'application/java-archive'});
    }
    let url = URL.createObjectURL(BSfile);
    let libJ = await cheerpjRunLibrary(url);
    require.register(rela, function(module){
      module.exports = libJ;
    });
  };
};
