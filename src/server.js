const https = require('https')
const skt = require('socket.io')
const fs = require('fs')
const path = require('path')
const PORT = 4000;
const app = require('./app')
const con = require('./database/db')

/// Connection to server
const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)

const server = new skt.Server(httpsServer, {
    cors: {
        origin: '*',
    }
})

app.get("/api/status", (req, res) => {
    res.status(200).send("Server is online");
});

server.on('connection', (socket) => {
    console.log("client connected");
    socket.on('disconnect', () => {
         console.log("client disconnected");
    })
});

//httpsServer.listen(PORT);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

