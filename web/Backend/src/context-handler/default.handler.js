import totoScrapper from '../services/toto-scraper'

const getLastTotoResults = async (ctx, _) => {
  const result = await totoScrapper.scrape()
  ctx.status = 200
  ctx.body = result[0]
}

const uploadTotoResult = async (ctx, _) => {
  const file = ctx.request.files.file
  const result = await totoScrapper.scan(file.path)

  ctx.status = 200
  ctx.body = result
}

export default {
  getLastTotoResults,
  uploadTotoResult
}
