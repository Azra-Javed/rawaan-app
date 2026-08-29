let socket: WebSocket | null = null;

const SOCKET_URL = "wss://rawaan-app-socket.onrender.com";

export const connectWebSocket = (
  onMessage?: (data: any) => void,
  onConnect?: () => void,
) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    onConnect?.(); // already connected -- still notify the caller
    return socket;
  }

  socket = new WebSocket(SOCKET_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
    onConnect?.(); // notify the caller once the connection actually opens
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (error) {
      console.log("WebSocket message error:", error);
    }
  };

  socket.onerror = (error) => {
    console.log("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    socket = null;
  };

  return socket;
};

export const sendWebSocketMessage = (data: any) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log("WebSocket is not connected");
    return false;
  }

  socket.send(JSON.stringify(data));
  return true;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const isWebSocketConnected = (): boolean => {
  return socket?.readyState === WebSocket.OPEN;
};
