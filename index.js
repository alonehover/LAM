const fs = require("fs");
const path = require("path")
const Koa = require('koa');
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const serverStatic = require("koa-static");
const views = require("koa-views");

const routers = require('./routers');

if(!fs.existsSync("./db/libData.json")) {
    fs.writeFileSync("./db/libData.json", JSON.stringify({}));
    console.log("数据存储文件创建成功");
}

const asyncLocal = require('./middleWare/asyncLocal')();

const app = new Koa();

app.use(logger());

app.use(bodyParser());

// 静态资源目录
app.use(serverStatic(path.resolve(__dirname, "./public/dist")));

// 页面模板目录
app.use(views(path.resolve(__dirname, "./views"), {map: {html: "ejs"}}));

routers(app);

app.listen(3000, () => {
    console.log("listening port 3000");
});

app.on('error', err => {
    log.error('server error', err)
});