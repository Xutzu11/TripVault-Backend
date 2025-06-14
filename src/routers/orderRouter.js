const {createTicket, addTicket, validateTicket, getTicket, deleteLocalTicket} = require("../services/orderService");
const {verifyUser, verifyAdmin} = require("../services/userService");
const {getAttractionByID} = require("../services/attractionService");
const { EmailBuilder, transporter, email } = require("../services/emailService");
const fs = require('fs');
const crypto = require('crypto');
const path = require("path");
const { uploadTicketStrategies } = require("../services/gcsService");
const { getCityByID, getStateByCityID } = require("../services/locationService");
const {Storage} = require('@google-cloud/storage');
const {loadConfig, resolveFilePath} = require('../../utils/configPathResolve.js');
const keyFilename = resolveFilePath('gcs.json');
const storage = new Storage({ keyFilename });
const buckets = loadConfig('bucket.json');
const os = require('os');
const con = require("../database/db.js");


module.exports = (app) => {
    app.post("/api/purchase", async (req, res) => {
        try {
            console.log("Purchase request received");
            const tmpDir = os.tmpdir();
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
                const ticketPath = path.join(tmpDir, `${ticketId}.png`);
            
                await createTicket(fullName, item.event, attraction[0], city[0].name, state[0].name, ticketId, ticketPath);
                await addTicket(userVerification.username, item.event.id, ticketId);

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
            const content = new EmailBuilder(itemsWithAttractions)
                                        .addHeader('Order Confirmation')
                                        .addUserParagraph(fullName)
                                        .addItemList()
                                        .addTotalPrice()
                                        .addFooter()
                                        .build();
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

            console.log("Sending email to:", receiver);
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
                console.log(`Uploading ticket ${info.ticketId} to GCS...`);
                await uploadTicketStrategies['gcs']({
                    originalname: `${info.ticketId}.png`,
                    mimetype: 'image/png',
                    buffer: ticketBuffer,
                });
                console.log(`Ticket ${info.ticketId} uploaded successfully.`);
                console.log(`Deleting local ticket file: ${info.ticketPath}`);
                deleteLocalTicket(info.ticketPath);
                console.log(`Local ticket file ${info.ticketPath} deleted.`);
            }

        } catch (error) {
            console.error('Error purchasing:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get("/api/ticket/:ticketId", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyAdmin(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const ticketId = req.params.ticketId;
            const ticket = await getTicket(ticketId);
            if (!ticket) {
                res.status(404).send('Ticket not found');
                return;
            }
            const options = {
                version: 'v4',
                action: 'read',
                expires: Date.now() + 2 * 60 * 1000, // 2 minutes
            };

            const [exists] = await storage.bucket(buckets.TICKETS_BUCKET_NAME).file(ticketId + '.png').exists();
            if (!exists) {
                res.status(404).send('Ticket not found');
                return;
            }

            const [url] = await storage
                .bucket(buckets.TICKETS_BUCKET_NAME)
                .file(ticketId + '.png')
                .getSignedUrl(options);
            res.status(200).json({
                ticket: ticket,
                url: url
            });
        } catch (error) {
            console.error('Error fetching ticket:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.delete("/api/ticket/:ticketId", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyAdmin(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const ticketId = req.params.ticketId;
            const ticket = await getTicket(ticketId);
            if (ticket) {
                await deleteTicket(ticketId);
                res.status(200).send('Ticket deleted successfully');
            } else {
                res.status(404).send('Ticket not found');
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.put("/api/ticket/validate/:ticketId", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyAdmin(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const ticketId = req.params.ticketId;
            const ticket = await getTicket(ticketId);
            console.log(ticket);
            if (ticket) {
                const result = await validateTicket(ticketId);
                if (result) {
                    res.status(200).send('Ticket validated successfully');
                } else {
                    res.status(400).send('Ticket already validated or expired');
                }
            } else {
                res.status(404).send('Ticket not found');
            }
        } catch (error) {
            console.error('Error validating ticket:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.put("/api/ticket/expire/:ticketId", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyAdmin(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const ticketId = req.params.ticketId;
            const ticket = await getTicket(ticketId);
            if (ticket) {
                await expireTicket(ticketId);
                res.status(200).send('Ticket expired successfully');
            } else {
                res.status(404).send('Ticket not found');
            }
        } catch (error) {
            console.error('Error expiring ticket:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}