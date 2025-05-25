class LoadUrlCC {
    static async fileToUrl(path, mimetype){
        let subBlob = await GameProps.getFileGame().file(path).async("blob");
        return URL.createObjectURL(new Blob([subBlob], { type: mimetype || "image/png" }));
    }
    static async setUrlToImg(img, path){
        let url = await LoadUrlCC.fileToUrl(path);
        img.src = url;
    }
}
