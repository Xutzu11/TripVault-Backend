const express = require('express')
const cors = require('cors')

const app = express()

app.use(express.json());
app.use(cors({
    origin: 'https://localhost:3000'
}));

require('./routers/attractionRouter')(app);
require('./routers/eventRouter')(app);
require('./routers/userRouter')(app);
require('./routers/locationRouter')(app);

module.exports = app