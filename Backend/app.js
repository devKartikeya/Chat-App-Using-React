const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('WebSocket server is running 🚀');
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());

            if (message.type === 'join') {
                clients.set(ws, message.username);

                wss.clients.forEach(client => {
                    if (client.readyState === 1 && client !== ws) {
                        client.send(JSON.stringify({
                            type: 'join',
                            message: 'joined the chat!',
                            username: message.username
                        }));
                    }
                });
                return;
            }

            if (message.type === 'message') {
                wss.clients.forEach(client => {
                    if (client.readyState === 1 && client !== ws) {
                        client.send(JSON.stringify({
                            type: 'message',
                            message: message.message,
                            username: message.username
                        }));
                    }
                });
            }

        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON'
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});