console.info("Loading Server...");
const ServerWebGamePost = require("ServerWebGamePost");
let ServerCC;
function processPack(datapacket){
  let pong = Date.now();
  console.info((pong - datapacket.ping)+"ms");
  ServerCC.sendDataPacket(datapacket.identifier, {
    pong: pong
  });
}
//cambiar puerto por el puerto abierto y null por icono del servidor si quieres un icono
ServerCC = new ServerWebGamePost.Server(3000, null, processPack);
console.info("Done!");
