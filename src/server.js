const https = require('https')
const skt = require('socket.io')
const fs = require('fs')
const path = require('path')
const PORT = 4000;
const app = require('./app')
const con = require('./database/db')
const email = require('../email.json')


/// Mail sender
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: email.service,
  auth: {
    user: email.user,
    pass: email.pass
  }
});

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

//setInterval(addRandomMuseums, 20);

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

app.post("/api/purchase", async (req, res) => {
    try {
        const cartItems = req.body.cart;
        const token = req.header('Authorization');
        const userVerification = await verifyUser(token);
        if (userVerification == null) {
            res.status(401).send('Access denied');
            return;
        }

        let message = `<h1>Order Confirmation</h1>`;
        message += `<p>Dear ${userVerification.fname},</p>`;
        message += `<p>Thank you for your purchase! Here is the summary of your order:</p>`;

        const attachments = [];
        const museumAndTicketsPromises = cartItems.map(async item => {
            const museum = await getMuseumByID(item.exhibition.mid);
            const ticketId = crypto.randomUUID();
            const ticketPath = path.join(__dirname, `./tickets/${ticketId}.png`);
            await createTicket(userVerification.fname + " " + userVerification.lname, item.exhibition, museum[0], ticketId, ticketPath);
            attachments.push({
                filename: ticketId + '.png',
                content: fs.createReadStream(ticketPath)
            });

            return {
                item,
                museum: museum[0]
            };
        });

        const itemsWithMuseums = await Promise.all(museumAndTicketsPromises);

        message += `<ul>`;
        itemsWithMuseums.forEach(({item, museum}) => {
            message += `<li>
                            <strong>${item.exhibition.name}, at ${museum.name}</strong><br>
                            ${item.exhibition.description}<br>
                            <img src="${museum.photo_path}" alt="${item.exhibition.name}" style="width: 100px; height: auto;"><br>
                            Quantity: ${item.quantity}<br>
                            Total Price: $${(item.quantity * item.exhibition.price).toFixed(2)}<br>
                            <p style="font-style: italic;">Available from ${new Date(item.exhibition.start_date).toLocaleDateString()} until ${new Date(item.exhibition.end_date).toLocaleDateString()}</p>
                        </li><br>`;
        });
        message += `</ul>`;
        message += `<p>Total amount: $${cartItems.reduce((acc, item) => acc + item.quantity * item.exhibition.price, 0).toFixed(2)}</p>`;
        message += '<strong>You will find the tickets attached to this email.</strong><br><br>'
        message += `<p>We hope you enjoy the exhibitions!</p>`;
        message += `<p style="font-style: italic;">Best regards,<br>Alex Ignat from Museums Team</p><br>`;
        message += '<img src="https://i.ibb.co/1f1WgXs/logo.png" alt="Logo" style="width: 100px; height: auto;">'
        message += `<br><br><br><p style="font-size: 10px;">This is an automatically generated email. Please do not reply to it.</p>`;
        const sender = email.user;
        const receiver = userVerification.email;
        const subject = "Your order has been confirmed";

        const mailOptions = {
            from: sender,
            to: receiver,
            subject: subject,
            html: message,
            attachments: attachments
        };
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                res.status(500).send('Error purchasing.');
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).send('Purchase successful! Please check your email for the confirmation.');
            }
        });

    } catch (error) {
        console.error('Error purchasing:', error);
        res.status(500).send('Internal Server Error');
    }
});