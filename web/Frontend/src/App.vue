<template>
  <div>
    <div
      v-if="!isLoading"
      class="cover-container d-flex h-100 p-3 mx-auto flex-column"
    >
      <header class="masthead mb-auto">
        <div class="inner">
          <div class="container">
            <div class="row">
              <div class="col-6">
                Draw: {{ this.drawDate }}
              </div>
              <div class="col-6 text-right">
                Draw Number: {{ this.drawNo }}
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <table
                  width="100%"
                  border="2"
                >
                  <tr>
                    <th
                      colspan="6"
                      style="text-align:center"
                    >
                      Winning Numbers
                    </th>
                  </tr>
                  <tr>
                    <td
                      v-for="(numbers, index) in winningNumbers"
                      :key="numbers.id"
                      align="center"
                    >
                      {{ index +"_"+numbers }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <table
                  width="100%"
                  border="2"
                >
                  <tr>
                    <th style="text-align:center">
                      Additional Numbers
                    </th>
                  </tr>
                  <tr>
                    <td align="center">
                      {{ this.additionalNumber }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main
        role="main"
        class="inner cover"
      >
        <CameraTesseract
          v-if="showScanner" 
          @onTakePhoto="onTakePhoto"
          @onTextRecognize="onTextRecognize"
        />
        <div v-else>
          <div v-if="!scanCompleted && !isScanning">
            <h1 class="cover-heading">
              Check your results.
            </h1>
            <p class="lead">
              Simply upload or take a picture of the TOTO ticket with your phone's
              camera and we will perform a quick scan and check it for you !
            </p>
            <p class="lead">
              <button
                class="btn btn-lg btn-secondary"
                @click="buttonScan"
              >
                Scan TOTO Ticket
              </button>
            </p>
          </div>
          <div v-else-if="isScanning">
            <h1 class="cover-heading">
              Scanning in progress...
            </h1>
            <p class="lead">
              Please wait while we are scanning. Patience is virtue !
            </p>
          </div>
          <div v-else-if="scanCompleted">
            <h1 class="cover-heading">
              Your results.
            </h1>
            <img :src="imgBuffer">
            <p class="lead">
              <table
                v-for="(result, index) in scannedResults"
                :key="result.id"
                align="center"
              >
                <tr>
                  <td colspan="2">
                    Row #{{ index+1 }}
                  </td>
                </tr>
                <tr>
                  <td>
                    Number of matches
                  </td>
                  <td>
                    {{ result.noOfMatches }}
                  </td>
                </tr>
                <tr>
                  <td>
                    Number that matches
                  </td>
                  <td>
                    {{ result.matches }}
                  </td>
                </tr>
                <tr>
                  <td>
                    Scanned Number
                  </td>
                  <td>
                    {{ result.scannedNumbers }}
                  </td>
                </tr>
              </table>
            <!--eslint-disable-next-line prettier-vue/prettier-->
            </p>
            <p class="lead">
              <button
                class="btn btn-lg btn-secondary"
                @click="restartForm"
              >
                Back
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer class="mastfoot mt-auto">
        <div class="inner float-right">
          <p>
            SG TOTO Scanner Version 1.0
          </p>
        </div>
      </footer>
    </div>
    <div v-else>
      Lucky TOTO scanner is now loading...
    </div>
  </div>
</template>

<script>
import backendService from './services/backend.service'
import moment from 'moment'
import CameraTesseract from 'tesseract-with-html5-camera/dist/lib/index.js'

export default {
  name: 'App',
  components: {
    CameraTesseract
  },
  data: () => ({
    isLoading: true,
    drawDate: null,
    drawNo: null,
    winningNumbers: [1, 2, 3, 4, 5, 6],
    additionalNumber: 0,
    scanCompleted: false,
    isScanning: false,
    showScanner: false
  }),
  async mounted() {
    const result = await backendService.getLastTotoResults()
    this.isLoading = false

    this.drawDate = moment(result.data.drawDate).format('Do MMM YYYY')
    this.drawNo = result.data.drawNo
    this.winningNumbers = result.data.winning
    this.additionalNumber = result.data.additional
  },
  methods: {
    async uploadImage(event) {
      const result = await backendService.uploadTotoResult(event)
      this.scannedResults = []
      result.data.forEach((e) => {
        this.scannedResults.push(e)
      })
    },
    buttonScan() {
      this.showScanner = true
    },
    restartForm() {
      this.scannedResults = null
      this.scanCompleted = false
      this.isScanning = false
    },
    onTakePhoto() {
      this.showScanner = false
      this.isScanning = true
    },
    onTextRecognize(text, imgBuffer) {
      this.imgBuffer = imgBuffer
      this.isScanning = false
      this.scanCompleted = true
      this.scannedResults = []
      console.log('Recognize text: ', text)
      const cleanText = []
      // eslint-disable-next-line prefer-regex-literals
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

      console.log(
        'cleanText text: ',
        cleanText.filter((x) => x.length === 12)
      )

      const wininngNumbers = [...this.winningNumbers, this.additionalNumber]

      cleanText
        .filter((x) => x.length === 12)
        .forEach((cleanNumber) => {
          const splitNumbers = []
          for (let i = 0; i < cleanNumber.length - 1; i = i + 2) {
            splitNumbers.push(cleanNumber[i] + '' + cleanNumber[i + 1])
          }

          const numberOfMatches = wininngNumbers.filter((e) =>
            splitNumbers.includes(e.toString())
          )

          this.scannedResults.push({
            noOfMatches: numberOfMatches.length,
            matches: numberOfMatches,
            scannedNumbers: splitNumbers
          })
        })
    }
  }
}
</script>
