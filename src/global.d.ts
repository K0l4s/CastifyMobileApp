declare global {
    interface Global {
      WebSocket: any;
      originalWebSocket: any;
      XMLHttpRequest: any;
      originalXMLHttpRequest: any;
    }
  }
  