const fs = require("fs");
const path = require("path");

const dbPath = path.resolve(__dirname, "./libData.json");
const libData = require(dbPath);

function writeFile(data) {
    try {
        fs.writeFileSync(dbPath, data);
        return "success";
    } catch(err) {
        throw err;
    }
};

const db = {
    init: function() {
        writeFile(JSON.stringify({}));
    },
    /**
     * 数据更新
     * @param {名称} name
     * @param {版本号} version
     * @param {是否上传cdn} async
     */
    update: function(name, version, async) {
        let localData = libData;
        
        if(!localData[name]) {
            localData[name] = {};
        }

        if(localData[name][version] && localData[name][version].async === async) {
            console.log(`${name} ${version} 该版本已同步`);
            return "该版本已存在";
        }

        localData[name][version] = {"async": async || 0};

        return writeFile(JSON.stringify(localData));
    },
    updateAll: function(data) {
        let listAll = JSON.stringify(data);
        return writeFile(listAll);
    },
    del: function(name, version) {
        return "后续添加该功能";
    }
};

module.exports = db;