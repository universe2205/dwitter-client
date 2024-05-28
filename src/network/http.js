import axios from 'axios';
import axiosRetry from 'axios-retry';

const defaultRetryConfig = {
  retries: 5,
  initialDelayMs: 100,
};
export default class HttpClient {
  constructor(baseURL, getCsrfToken, config = defaultRetryConfig) {
    this.baseURL = baseURL;
    this.getCsrfToken = getCsrfToken;
    this.client = axios.create({
      baseURL: baseURL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    axiosRetry(this.client, {
      retries: config.retries,
      retryDelay: (retryCount) => {
        const delay = Math.pow(2, retryCount) * config.initialDelayMs;
        const jitter = delay * 0.1 * Math.random();
        return delay + jitter;
      },
      retryCondition: (err) => axiosRetry.isNetworkOrIdempotentRequestError(err) || err.response.status === 429,
    });
  }

  async fetch(url, options) {
    const { body, method, headers } = options;
    const request = {
      url,
      method,
      headers: {
        ...headers,
        'dwitter-csrf-token': this.getCsrfToken(),
      },
      data: body,
    };
    try {
      const response = await this.client(request);
      return response.data;
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        const message = data && data.message ? data.message : 'Something went wrong';
        throw new Error(message);
      }
      throw new Error('Something went wrong');
    }
  }
}
