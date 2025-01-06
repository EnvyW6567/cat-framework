class FetchWrapper {
    #baseUrl;

    constructor() {
        this.#baseUrl = 'http://localhost:3000';
    }

    async get(url) {
        const headers = {};
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            headers['Authorization'] = sessionId;
        }

        return await fetch(this.#baseUrl + url, {
            method: 'GET',
            headers,
        })
            .then(async (response) => {
                const data = await response.json();

                if (response.status === 200) {
                    return data;
                }
                throw new Error(data.toString());
            })
            .catch((e) => {
                console.error(e);
            });
    }

    async post(url, body = {}) {
        const headers = { 'Content-Type': 'application/json' };
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            headers['Authorization'] = sessionId;
        }

        return await fetch(this.#baseUrl + url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        }).then(async (response) => {
            const data = await response.json();
            console.log(response);

            if (response.status === 200) {
                return data;
            }
            throw new Error(data.toString());
        });
    }
}

export const fetchWrapper = new FetchWrapper();
