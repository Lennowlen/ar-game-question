export class FetchService {
    static async fetchData() {
        try {
            const response = await fetch('http://localhost:3000/Questions')
            if (!response.ok) {
                throw new Error('Response not 200 OK!')
            }
            // response.setHeader("Access-Control-Allow-Origin", "*");
            const data = await response.json()
            return data
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static getLog() {
        return "halo"
    }
}