const fs = require("fs");
const path = require("path");
const Router = require("koa-router");

const router = new Router();

const routers = function(app) {
    const FS_CONTROLLER_PATH = path.join(__dirname, "../controllers/");
    let pathName = "";

    const mapFiles = function(dirPath) {
        fs.readdirSync(dirPath).forEach(function(name) {
            var file = path.join(dirPath, name);
            if(fs.statSync(file).isDirectory()) {
                pathName = name;
                mapFiles(file);
                pathName = "";
                return;
            }
            var obj = require(`../controllers/${pathName ? pathName + "/" + name : name}`);
            obj.init && obj.init(router);
        });
    };

    mapFiles(FS_CONTROLLER_PATH);

    app.use(router.routes(), router.allowedMethods());
};

module.exports = routers;
