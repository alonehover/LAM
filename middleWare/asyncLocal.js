const fs = require("fs");
const qiniu = require("qiniu");

const db = require("../db/lib.model");
const CDN = require("../util/cdn");

/**
 * 同步本地数据
 * @param {*} ctx
 * @param {*} next
 */
const asyncLocal = async function() {
    var options = {
        prefix: 'npm/'
    };

    console.log("从空间获取数据同步...");
    var list = await CDN.bucketList(options);

    if(Array.isArray(list)) {           
        list.forEach(function(item) {
            const itemArr = item.key.split("/");    // "npm/[模块名]/[版本号]/[模块名].min.js"
            const itemName = itemArr[1];
            const itemVersion = String(itemArr[2]);
            db.update(itemName, itemVersion, 1);
        });

        console.log("数据更新完成");
    }

    return list;
};

module.exports = asyncLocal;