import { YSocketIO } from "y-socket.io/dist/server";

/**
 * Initializes the Yjs Socket.io collaboration service.
 * @param {import("socket.io").Server} io - The Socket.io server instance.
 * @returns {YSocketIO} The initialized YSocketIO instance.
 */
export const initCollaboration = (io) => {
  const ysocketio = new YSocketIO(io, {
    gcEnabled: true,
  });

  ysocketio.initialize();

  io.on("connection", (socket) => {
    console.log(`📡 New socket connection: ${socket.id}`);
    
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return ysocketio;
};
