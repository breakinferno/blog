// 引入模块
import Koa from 'koa'
import KoaStatic from 'koa-static'
import KoaViews from 'koa-views';
import bodyParser from 'koa-bodyparser'
import apolloServer from './graphql'
import baseContext from './middleware/baseContext'
import { System } from './config'
import db from './db'
import routes from './router'
import site from './router/site'
const cors = require('@koa/cors');

const app = new Koa()
// 应用graphql
apolloServer.applyMiddleware({ app });

const env = process.env.NODE_ENV || 'development' // Current mode
db.start();
if (env === 'development') { // logger
    app.use((ctx, next) => {
        const start = new Date()
        return next().then(() => {
            const ms = new Date() - start
            console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
        })
    })
}
app.use(baseContext);
app.use(cors());
// app.use(auth())
// 使用 bodyParser 和 KoaStatic 中间件
app.use(bodyParser());
// console.log(require('path').resolve(__dirname, '../../client/vue-blog/dist/'))
app.use(KoaViews(require('path').resolve(__dirname, '../../client/vue-blog/dist/')));
app.use(KoaStatic(require('path').resolve(__dirname, '../../client/vue-blog/dist')));
// console.log(routes)
app.use(routes)
app.use(site.routes())
app.use(function(ctx, next) {
    // console.log(ctx)
    switch (ctx.status) {
        case 404:
            ctx.body = '没有找到内容 - 404'
            break
    }
    return next()
})
app.listen(System.port);

console.log('graphQL server listen port: ' + System.port)
console.log('please visit the url: http://localhost:' + System.port + '/graphql')