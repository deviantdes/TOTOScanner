import axios from 'axios'
import FormData from 'form-data'

const getLastTotoResults = () => {
  return axios.get(`${process.env.VUE_APP_BACKEND_URL}/getLastTotoResults`)
}

const uploadTotoResult = (event) => {
  const data = new FormData()
  data.append('name', 'my-picture')
  data.append('file', event.target.files[0])

  return axios.post(`${process.env.VUE_APP_BACKEND_URL}/uploadTotoResult`, data)
}

export default {
  getLastTotoResults,
  uploadTotoResult
}
