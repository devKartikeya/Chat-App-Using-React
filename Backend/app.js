const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('Received:', message);

            if (message.type === 'join') {
                clients.set(ws, message.username);
                wss.clients.forEach(client => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({ type: 'join', message: `joined the chat!`, username: message.username }));
                    }
                });
                return;
            }

            if (message.type === 'message') {
                console.log('Broadcasting message:', message.message);
                wss.clients.forEach(client => {
                    if (client.readyState === 1 && client !== ws) {
                        client.send(JSON.stringify({ type: 'message', message: message.message, username: message.username }));
                    }
                });
            }
        } catch (error) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        }
    });

});

wss.on('close', () => {
    console.log('Client disconnected');
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});