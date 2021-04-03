import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import defaultRoute from './routes/default.route'
import koaBody from 'koa-body'

require('dotenv').config()
require('use-strict')

const app = new Koa()
const ports = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser())

app.use(koaBody({ multipart: true }));
app.use(defaultRoute.routes())
app.use(defaultRoute.allowedMethods())
app.use(ctx => {
    if (ctx.response.status === 404) {
        ctx.status = 404
        ctx.body = `${ctx.request.url} page is not found`
    }
})

app.listen(ports, () => {
    console.log(`Listening on port ${ports}...`)
})
