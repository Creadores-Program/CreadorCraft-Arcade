window.CreadorCraftLanAPI = class CreadorCraftLanAPI {
    static peerConnection;
    static dataChannel;
    static ICE_SERVERS = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
    ];
    #prefix = "[CreadorCraftLanAPI] ";
    #eventListenerscandidatefound = [];
    #eventListenersconnectionstatechange = [];
    #eventListenersdatachannel = [];
    #eventListenersdatachannelopen = [];
    #eventListenersresponsedata = [];
    #eventListenersclose = [];
    #eventListenerserror = [];
    candidates = [];
    static async createInicializer(){
        let instance = new window.CreadorCraftLanAPI(true);
        let jsonres;
        try{
            const offer = await window.CreadorCraftLanAPI.peerConnection.createOffer();
            await window.CreadorCraftLanAPI.peerConnection.setLocalDescription(offer);
            jsonres = offer;
        }catch(e) {
            console.error("[CreadorCraftLanAPI] Error al crear la oferta:", e);
            return null;
        }
        return {
            keyJson: jsonres,
            instance: instance
        };
    }
    static async createResponder(offer){
        let instance = new window.CreadorCraftLanAPI(false);
        let jsonres;
        try{
            const remooffer = new RTCSessionDescription(offer);
            await window.CreadorCraftLanAPI.peerConnection.setRemoteDescription(remooffer);
            const answer = await window.CreadorCraftLanAPI.peerConnection.createAnswer();
            await window.CreadorCraftLanAPI.peerConnection.setLocalDescription(answer);
            jsonres = answer;
        }catch(e) {
            console.error("[CreadorCraftLanAPI] Error al crear la respuesta:", e);
            return null;
        }
        return {
            keyJson: jsonres,
            instance: instance
        };
    }
    constructor(isInitiator = false){
        if(window.CreadorCraftLanAPI.peerConnection) {
            console.warn(this.#prefix+"Ya Exite una conexión establecida!, reiniciando.");
            window.CreadorCraftLanAPI.peerConnection.close();
        }
        console.info(this.#prefix+"Creando conexión...");
        window.CreadorCraftLanAPI.peerConnection = new RTCPeerConnection({ iceServers: window.CreadorCraftLanAPI.ICE_SERVERS });
        window.CreadorCraftLanAPI.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.info(this.#prefix+"Candidato ICE Local generado:", event.candidate);
                this.#processEvents("candidatefound", event.candidate.toJSON());
                this.candidates.push(event.candidate.toJSON());
            }
        };
        window.CreadorCraftLanAPI.peerConnection.oniceconnectionstatechange = () => {
            console.info(this.#prefix+"Estado de conexión ICE: "+window.CreadorCraftLanAPI.peerConnection.iceConnectionState);
            this.#processEvents("connectionstatechange", { connectionState: window.CreadorCraftLanAPI.peerConnection.iceConnectionState });
        };
        window.CreadorCraftLanAPI.peerConnection.ondatachannel = (event) => {
            window.CreadorCraftLanAPI.dataChannel = event.channel;
            this.#processEvents("datachannel", event.channel);
            #setupDataChannelListeners();
        };
        if (isInitiator) {
            window.CreadorCraftLanAPI.dataChannel = window.CreadorCraftLanAPI.peerConnection.createDataChannel("CreadorCraftLanChannel");
            #setupDataChannelListeners();
        }
    }
    #processEvents(eventName, data){
        let event = new CustomEvent(eventName, {
            detail: data
        });
        this.dispatchEvent(event);
    }
    #setupDataChannelListeners(){
        if (!window.CreadorCraftLanAPI.dataChannel) {
            console.warn(this.#prefix+"No hay un canal de datos disponible para configurar los listeners.");
            return;
        }
        window.CreadorCraftLanAPI.dataChannel.onopen = () => {
            this.#processEvents("datachannelopen", { channel: window.CreadorCraftLanAPI.dataChannel });
        };
        window.CreadorCraftLanAPI.dataChannel.onmessage = (event) => {
            try{
                this.#processEvents("responsedata", JSON.parse(event.data));
            }catch(e) {
                this.#processEvents("error", e);
            }
        };
        window.CreadorCraftLanAPI.dataChannel.onclose = () => {
            this.#processEvents("close", { channel: window.CreadorCraftLanAPI.dataChannel });
        };
        window.CreadorCraftLanAPI.dataChannel.onerror = (error) => {
            this.#processEvents("error", error);
        };
    }
    dispatchEvent(event){
        let eventName = event.type;
        if (this["#eventListeners"+eventName]) {
            for(let listener of this["#eventListeners"+eventName]) {
                if (typeof listener === "function") {
                    try{
                        listener(event);
                    }catch(e) {
                        console.error(this.#prefix+"Error al ejecutar el listener:", e);
                    }
                } else if (listener.handleEvent) {
                    try{
                        listener.handleEvent(event);
                    }catch(e) {
                        console.error(this.#prefix+"Error al ejecutar el listener con handleEvent:", e);
                    }
                }
            }
        }
    }
    addEventListener(eventName, listener){
        eventName = eventName.toLowerCase();
        if (!this["#eventListeners"+eventName]) {
            console.warn(this.#prefix+"No Existe el evento '"+eventName+"'");
            return;
        }
        if (typeof listener !== "function" && !listener.handleEvent) {
            console.warn(this.#prefix+"El listener debe ser una función o un objeto con el método handleEvent.");
            return;
        }
        this["#eventListeners"+eventName].push(listener);
    }
    async addRemoteICECandidate(candidate) {
        await window.CreadorCraftLanAPI.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
    async acceptResponse(respon){
        if (!window.CreadorCraftLanAPI.peerConnection) {
            console.error(this.#prefix+"No hay una conexión establecida para aceptar la respuesta.");
            return;
        }
        try {
            const answer = new RTCSessionDescription(respon);
            await window.CreadorCraftLanAPI.peerConnection.setRemoteDescription(answer);
        } catch (error) {
            console.error(this.#prefix+"Error al aceptar la respuesta:", error);
            this.#processEvents("error", error);
        }
    }
    sendDataPacket(data) {
        if (!window.CreadorCraftLanAPI.dataChannel || window.CreadorCraftLanAPI.dataChannel.readyState !== "open") {
            console.error(this.#prefix+"El canal de datos no está abierto o no existe.");
            return;
        }
        try {
            window.CreadorCraftLanAPI.dataChannel.send(JSON.stringify(data));
        } catch (error) {
            console.error(this.#prefix+"Error al enviar el paquete de datos:", error);
            this.#processEvents("error", error);
        }
    }
};