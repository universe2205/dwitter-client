export default class HttpClient {
  constructor(baseURL, getCsrfToken) {
    this.baseURL = baseURL;
    this.getCsrfToken = getCsrfToken;
  }

  async fetch(url, options) {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'dwitter-csrf-token': this.getCsrfToken(),
      },
      credentials: 'include',
    });
    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error(err);
    }
    if (response.status > 299 || response.status < 200) {
      const message = data && data.message ? data.message : 'Something went wrong';
      throw new Error(message);
    }
    return data;
  }
}
