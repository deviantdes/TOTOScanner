import Router from 'koa-router'
import defaultHandler from '../context-handler/default.handler'

const router = new Router({ prefix: '/api' })

// router.use(async (ctx, next) => {
//     console.log('CHECK COOKIE')
//     await next()
// })

router.get('/getLastTotoResults', defaultHandler.getLastTotoResults)
router.post('/uploadTotoResult', defaultHandler.uploadTotoResult)

export default router
