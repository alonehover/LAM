const fs = require("fs");
const request = require("request");
const mkdirp = require("mkdirp");
const qiniu = require("qiniu");

const conf = require("../config.json");
const libData = require("../db/libData.json")
const db = require("../db/lib.model");
const CDN = require("../util/cdn");

const bucket = conf.QNKey.BUCKET;     //要上传的空间
const accessKey = conf.QNKey.AK;
const secretKey = conf.QNKey.SK;

const libOriginHost = conf.libOriginHost;
const saveDir = conf.tempPath;

const asyncFile = {
    init(router) {
        router.get("/", this.index.bind(this));
        // router.get("/list", this.cdn.bind(this));
    },

    async index(ctx, next) {
        this.asyncLib();
        ctx.body = "hello cdn";
        await next();
    },

    asyncLib() {
        const self = this        
        let libUrl = [];

        for (const name in libData) {
            if (libData.hasOwnProperty(name)) {
                const versions = Object.keys(libData[name]);

                for (const ver of versions) {
                    if(libData[name][ver].async === 0) {
                        const resUrl = `${libOriginHost}/${name}/${ver}/${name}.min.js`;
                        const tempPath = saveDir + `/${name}/${ver}`
    
                        mkdirp(tempPath, function(err) {
                            if(err) {
                                console.log(err)
                            }
    
                            self.download(resUrl, tempPath , name);
                        });
                    }
                }
            }
        }
    },

    async download(url, tempPath, name) {
        const self = this;
        const filePath = tempPath + "/" + name + ".min.js";

        if(fs.existsSync(filePath)) {
            console.log(filePath + " 文件已存在");
            self.fileUpload(filePath);
            return;
        }

        console.log(filePath + " 文件不存在，即将下载...");

        const down = request(url).pipe(fs.createWriteStream(filePath));

        down.on("close", function() {
            console.log(filePath + " 文件已保存！");
            self.fileUpload(filePath);
        })
    },

    async fileUpload(filePath) {
        var localPath = filePath // "./temp/jquery/3.3.1/jquery.min.js";
        var key = "npm" + localPath.replace(new RegExp(saveDir, 'g'), "");
        console.log("上传文件...")
        var status = await CDN.upload(key, localPath);

        console.log(status);
        if(status.hash) {
            var fileInfo = key.split("/");
            const status = db.update(fileInfo[1], fileInfo[2], 1);
            if(status === "success") {
                console.log("同步完成")
            }
        }
    }
};

module.exports = asyncFile;
