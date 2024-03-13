let io;

module.exports = {
    init: httpServer => {
        const {Server} = require("socket.io")
        io = new Server(httpServer, {
            cors: {
                origin: process.env.NODE_ENV === "production" ? false:
                ["https://localhost:8080", "http://localhost:3000"]
            }
        })
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized")
        }
        return io;
    }
}