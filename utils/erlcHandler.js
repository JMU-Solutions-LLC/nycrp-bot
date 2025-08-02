const axios = require('axios');

class ERLCHandler {
    constructor(serverKey) {
        this.serverKey = serverKey;
        this.queues = new Map();
        this.bucketResets = new Map();
    }

    async request(endpoint, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            if (!this.queues.has(endpoint)) this.queues.set(endpoint, []);
            this.queues.get(endpoint).push({ endpoint, method, data, resolve, reject });
            this.processQueue(endpoint);
        });
    }

    async processQueue(endpoint) {
        const queue = this.queues.get(endpoint);
        if (!queue || queue.processing) return;

        queue.processing = true;

        while (queue.length > 0) {
            const now = Date.now();
            const resetTime = this.bucketResets.get(endpoint) || 0;

            if (now < resetTime) {
                const waitTime = resetTime - now;
                console.log(`⏳ [${endpoint}] Rate limited. Waiting ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
            }

            const { method, data, resolve, reject } = queue.shift();
            try {
                const response = await axios({
                    url: `https://api.policeroleplay.community${endpoint}`,
                    method,
                    headers: {
                        'server-key': this.serverKey,
                        'Accept': '*/*',
                    },
                    data,
                });

                this.updateRateLimit(endpoint, response.headers);
                resolve(response.data);

            } catch (error) {
                if (error.response?.status === 429) {
                    const reset = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
                    this.bucketResets.set(endpoint, reset);

                    queue.unshift({ method, data, resolve, reject });
                    await new Promise(r => setTimeout(r, reset - Date.now()));
                } else {
                    console.error(`❌ [${endpoint}] Error:`, error.message);
                    reject(error);
                }
            }
        }

        queue.processing = false;
    }

    updateRateLimit(endpoint, headers) {
        const bucket = headers['x-ratelimit-bucket'] || endpoint;
        const remaining = parseInt(headers['x-ratelimit-remaining']);
        const reset = parseInt(headers['x-ratelimit-reset']) * 1000;

        if (remaining <= 0) this.bucketResets.set(bucket, reset);
    }
}

module.exports = new ERLCHandler(process.env.SERVER_KEY);