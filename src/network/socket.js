import socket from 'socket.io-client';

export default class Socket {
  constructor(baseURL, getAccessToken) {
    this.io = socket(baseURL, {
      auth: (cb) => cb({ token: getAccessToken() }),
      transports: ['websocket'],
    });

    this.io.on('connect_error', (error) => {
      console.log('socket error', error.message);
    });
  }

  onSync(event, callback) {
    if (!this.io.connected) {
      this.io.connect();
    }

    this.io.on(event, (msg) => callback(msg));
    return () => this.io.off(event);
  }
}
