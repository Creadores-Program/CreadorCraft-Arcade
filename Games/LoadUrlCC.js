class LoadUrlCC {
    async static fileToUrl(path, mimetype){
        let subBlob = await GameProps.getFileGame().file(path).Async("blob");
        return URL.createObjectURL(new Blob([subBlob], { type: mimetype || "image/png" }));
    }
}