const qiniu = require("qiniu");
const conf = require("../config.json");

const bucket = conf.QNKey.BUCKET;     //要上传的空间
const accessKey = conf.QNKey.AK;
const secretKey = conf.QNKey.SK;

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
//config.useHttpsDomain = true;
config.zone = qiniu.zone.Zone_z0;

const CDN = {
    /**
     * 获取空间文件列表
     * @param option 七牛参数，暂时只支持前缀全量查询
     */
    bucketList: async function(options) {
        var bucketManager = new qiniu.rs.BucketManager(mac, config);
        // @param options 列举操作的可选参数
        //                prefix    列举的文件前缀
        //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
        //                limit     每次返回的最大列举文件数量
        //                delimiter 指定目录分隔符
        var options = {
        //   limit: 10,
            prefix: options.prefix || ""
            // delimiter: "/"
        };

        var list = await new Promise(function(resolve, reject) {
            bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
                if (err) {
                    throw err;
                }

                if (respInfo.statusCode == 200) {
                    //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
                    //指定options里面的marker为这个值
                    var nextMarker = respBody.marker;
                    var commonPrefixes = respBody.commonPrefixes;

                    var items = respBody.items;
                    resolve(items)
                } else {
                    reject({
                        code: respInfo.statusCode,
                        msg: respBody
                    });
                }
            });
        });

        return list;
    },
    /**
     * 上传文件
     * @param key 存储文件名
     * @param filePath 本地文件路径
     */
    upload: async function(key, filePath) {
        var options = {
            scope: bucket,
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);

        var uploadToken = putPolicy.uploadToken(mac);

        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        // 文件上传
        var status = await new Promise(function(resolve, reject) {
            formUploader.putFile(uploadToken, key, filePath, 
                putExtra, function(respErr, respBody, respInfo) {
                    if (respErr) {
                        console.log(respErr);
                        throw respErr;
                    }
                    if (respInfo.statusCode == 200) {
                        // console.log(respBody);
                        resolve(respBody);
                    } else {
                        console.log(respInfo.statusCode);
                        console.log(respBody);
                        reject({
                            code: respInfo.statusCode,
                            msg: respBody
                        });
                    }
                });
        });

        return status;
    }
};

module.exports = CDN;