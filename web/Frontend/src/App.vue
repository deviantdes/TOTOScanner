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
              <div class="col-6">Draw: {{ this.drawDate }}</div>
              <div class="col-6 text-right">Draw Number: {{ this.drawNo }}</div>
            </div>
            <div class="row">
              <div class="col-12">
                <table width="100%" border="2">
                  <tr>
                    <th colspan="6" style="text-align:center">
                      Winning Numbers
                    </th>
                  </tr>
                  <tr>
                    <td
                      v-for="(numbers, index) in winningNumbers"
                      :key="numbers.id"
                      align="center"
                    >
                      {{ numbers }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <table width="100%" border="2">
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
      <main role="main" class="inner cover">
        <div v-if="!isScanning">
          <h1 class="cover-heading">Check your results.</h1>
          <p class="lead">
            Simply upload or take a picture of the TOTO ticket with your phone's
            camera and we will perform a quick scan and check it for you !
          </p>
          <p class="lead">
            <a
              href="#"
              class="btn btn-lg btn-secondary"
              onclick="document.getElementById('getFile').click()"
              >Upload TOTO Ticket</a
            >
            <input
              type="file"
              id="getFile"
              style="display:none"
              accept="image/*"
              @change="uploadImage"
            />
          </p>
        </div>

        <div v-else-if="isScanning && !scannedResults">
          <h1 class="cover-heading">Scanning in progress...</h1>
          <p class="lead">
            Please wait while we are scanning. Patience is virtue !
          </p>
        </div>
        <div v-else>
          <h1 class="cover-heading">Your results.</h1>
          <p class="lead"></p>
          <p
            v-for="(result, index) in scannedResults"
            :key="result.id"
            align="center"
          >
            <table>
              <tr>
                <td colspan="2">
                  Row #{{ index+1}}
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
          </p>
          <p class="lead">
            <button class="btn btn-lg btn-secondary" @click="restartForm">
              Back
            </button>
          </p>
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
    <div v-else>Lucky TOTO scanner is now loading...</div>
  </div>
</template>

<script>
import backendService from "./services/backend.service";
import moment from "moment";

export default {
  name: "App",
  data: () => ({
    isLoading: true,
    drawDate: null,
    drawNo: null,
    winningNumbers: [1, 2, 3, 4, 5, 6],
    additionalNumber: 0,
    isScanning: false,
    scannedResults: null,
  }),
  components: {},
  async mounted() {
    const result = await backendService.getLastTotoResults();
    this.isLoading = false;

    this.drawDate = moment(result.data.drawDate).format("Do MMM YYYY");
    this.drawNo = result.data.drawNo;
    this.winningNumbers = result.data.winning;
    this.additionalNumber = result.data.additional;
  },
  methods: {
    async uploadImage(event) {
      this.isScanning = true;
      const result = await backendService.uploadTotoResult(event);
      this.scannedResults = [];
      result.data.forEach((e) => {
        this.scannedResults.push(e);
      });
    },
    restartForm() {
      this.isScanning = false;
      this.scannedResults = null;
    },
  },
};
</script>
