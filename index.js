const Koa = require('koa');
const fs = require("fs");

const routers = require('./routers');

if(!fs.existsSync("./db/libData.json")) {
    fs.writeFileSync("./db/libData.json", JSON.stringify({}));
    console.log("数据存储文件创建成功");
}

const asyncLocal = require('./middleWare/asyncLocal')();

const app = new Koa();

// x-response-time 
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});



routers(app);

app.listen(3000, () => {
    console.log("listening port 3000");
});

app.on('error', err => {
    log.error('server error', err)
});