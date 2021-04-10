import Router from 'koa-router'
import defaultHandler from '../context-handler/default.handler'

const router = new Router({ prefix: '/api' })

// router.use(async (ctx, next) => {
//   console.log("1")
//   await next()
//   console.log("2")
// })

router.get('/getLastTotoResults', defaultHandler.getLastTotoResults)
router.post('/uploadTotoResult', defaultHandler.uploadTotoResult)

export default router
