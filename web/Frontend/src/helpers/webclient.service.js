import axios from 'axios'
import FormData from 'form-data'

class Webclient {
    async get({ url, params }) {
        try {
            return await axios.get(`${process.env.VUE_APP_BACKEND_URL}/${url}`, { params: params })
        } catch (error) {
            console.error(error)
        }
    }
}

export default new Webclient()