//cambia domain.com por dominio o ip de tu servidor y también con el puerto 
const ClientServ = new ServerWebGamePostClient("domain.com", 3000, true);
function processPack(datapacket){
  //procesar datapackets recibidos
  pingG.innerHTML = (Date.now() - datapacket.pong) + "ms";
}
ClientServ.processDatapacks = processPack;
//cambiar identifier por un generador de identificador o usar id del jugador...
setInterval(function(){
ClientServ.sendDataPacket({
  identifier: "108023",
  ping: Date.now()
});
}, 0);
