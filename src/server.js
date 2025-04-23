const express = require('express')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
const path = require('path')
const skt = require('socket.io')
const PORT = 4000
const app = express()

app.use(express.json());
app.use(cors({
    origin: 'https://localhost:3000'
}));

require('./routers/attractionRouter')(app);
require('./routers/eventRouter')(app);
require('./routers/userRouter')(app);
require('./routers/locationRouter')(app);
require('./routers/stripeRouter')(app);
require('./routers/orderRouter')(app);

// TODO: make this work 
/*
const httpsServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)

const server = new skt.Server(httpsServer, {
    cors: {
        origin: '*',
    }
})

httpsServer.listen(PORT);
*/

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app