import puppeteer from 'puppeteer'
import tesseract from 'tesseract.js'
import redis from 'redis'

const client = redis.createClient(process.env.REDIS_URL)

const isProduction = true

const scrape = async () => {
  let results = null
  const redisGet = new Promise((resolve, reject) => {
    client.get('winningNumbers', (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })

  results = await redisGet

  if (results) {
    return JSON.parse(results)
  }

  const browser = await puppeteer.launch({
    headless: isProduction,
    args: isProduction ? ['--no-sandbox'] : []
  })

  const page = await browser.newPage()
  const response = await page
    .goto(
      'http://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
      {
        waitUntil: 'networkidle0'
      }
    )
    .catch((e) => {
      console.error('[ERROR]: Problem loading Toto page \n', e)
    })

  if (!response) {
    return []
  }

  results = await page
    .evaluate(() => {
      const items = [...document.querySelectorAll('.tables-wrap')]
      return items.map((item) => {
        const drawNo = Number(
          item.querySelector('.drawNumber').textContent.trim().split(' ')[2]
        )
        const drawDate = Date.parse(
          item.querySelector('.drawDate').textContent.trim()
        )

        const winning = [
          Number(item.querySelector('.win1').textContent.trim()),
          Number(item.querySelector('.win2').textContent.trim()),
          Number(item.querySelector('.win3').textContent.trim()),
          Number(item.querySelector('.win4').textContent.trim()),
          Number(item.querySelector('.win5').textContent.trim()),
          Number(item.querySelector('.win6').textContent.trim())
        ]

        const additional = Number(
          item.querySelector('.additional').textContent.trim()
        )

        return {
          drawNo: drawNo,
          drawDate: drawDate,
          winning: winning,
          additional: additional
        }
      })
    })
    .catch((e) => {
      console.error(e)
    })

  client.setex('winningNumbers', 60 * 5, JSON.stringify(results))

  return results
}

const _scanAndClean = async (filePath) => {
  const worker = tesseract.createWorker()
  console.log('step 1===>')
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })
  await worker.setParameters({
    tessedit_pageseg_mode: tesseract.PSM.PSM_AUTO_OSD
  })
  const {
    data: { text }
  } = await worker.recognize(filePath, 'eng')

  const cleanText = []
  console.log('step 2===>')

  const r = new RegExp('(\\d\\s*){12}')
  const _removeByIndex = (str, index) => {
    return str.slice(0, index) + str.slice(index + 1)
  }

  const _recursive = (str, index) => {
    if (index > str.length) {
      const matchedNumber = str.match(r)

      if (matchedNumber) cleanText.push(matchedNumber[0])

      return
    }
    const currentNumber = str.charAt(index) + str.charAt(index + 1)
    if (currentNumber <= 49) {
      index += 2
      _recursive(str, index)
    } else {
      _recursive(_removeByIndex(str, index), index)
    }
  }
  console.log('step 3===>', text)

  text
    .split(/\r?\n/)
    .filter((x) => x.length >= 12)
    .forEach((numberRow) => {
      _recursive(numberRow, 0)
    })

  await worker.terminate()

  return cleanText
}

const scan = async (filePath) => {
  try {
    const results = []
    const cleanedNumbers = await _scanAndClean(filePath)
    const scrappedData = await scrape()
    const wininngNumbers = [
      ...scrappedData[0].winning,
      scrappedData[0].additional
    ]

    cleanedNumbers.forEach((cleanNumber) => {
      const splitNumbers = []
      for (let i = 0; i < cleanNumber.length - 1; i = i + 2) {
        splitNumbers.push(cleanNumber[i] + '' + cleanNumber[i + 1])
      }

      const numberOfMatches = wininngNumbers.filter((e) =>
        splitNumbers.includes(e.toString())
      )

      results.push({
        noOfMatches: numberOfMatches.length,
        matches: numberOfMatches,
        scannedNumbers: splitNumbers
      })
    })

    return results
  } catch (e) {
    console.log('error=>', e)
  }
}

export default {
  scrape,
  scan
}
