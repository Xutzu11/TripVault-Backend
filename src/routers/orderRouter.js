const {createTicket, deleteTicket} = require("../services/orderService");
const {mailContent} = require("../services/orderService");
const {verifyUser} = require("../services/userService");
const {getAttractionByID} = require("../services/attractionService");
const { transporter, email } = require("../services/emailService");
const fs = require('fs');
const crypto = require('crypto');
const path = require("path");
const { uploadTicketToGCS } = require("../services/gcsService");
const { getCityByID, getStateByCityID } = require("../services/locationService");

module.exports = (app) => {
    app.post("/api/purchase", async (req, res) => {
        try {
            const cartItems = req.body.cart;
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const fullName = userVerification.first_name + " " + userVerification.last_name;
            const ticketInfoList = [];

            for (const item of cartItems) {
                const attraction = await getAttractionByID(item.event.attractionId);
                const city = await getCityByID(attraction[0].city_id);
                const state = await getStateByCityID(attraction[0].city_id);
                const ticketId = crypto.randomUUID();
                const ticketPath = path.resolve(__dirname, `../../tickets/${ticketId}.png`);
            
                await createTicket(fullName, item.event, attraction[0], city[0].name, state[0].name, ticketId, ticketPath);
                        
                ticketInfoList.push({
                    item,
                    attraction: attraction[0],
                    ticketId,
                    ticketPath,
                });
            }

            const attachments = ticketInfoList.map(info => ({
                filename: info.ticketId + '.png',
                content: fs.createReadStream(info.ticketPath)
            }));

            const itemsWithAttractions = ticketInfoList.map(({ item, attraction }) => ({ item, attraction }));
            const content = mailContent(fullName, itemsWithAttractions);
            const sender = email.USER;
            const receiver = userVerification.email;
            const subject = "Your order has been confirmed";
            
            const mailOptions = {
                from: sender,
                to: receiver,
                subject: subject,
                html: content,
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

            for (const info of ticketInfoList) {
                const ticketBuffer = fs.readFileSync(info.ticketPath);
                await uploadTicketToGCS({
                    originalname: `${info.ticketId}.png`,
                    mimetype: 'image/png',
                    buffer: ticketBuffer,
                });
                deleteTicket(info.ticketPath);
            }

        } catch (error) {
            console.error('Error purchasing:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}