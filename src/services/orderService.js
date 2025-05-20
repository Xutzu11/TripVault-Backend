const sharp = require('sharp')
const QRCode = require('qrcode');
const TextToSVG = require('text-to-svg');
const path = require('path');
const fs = require('fs');
const con = require('../database/db');
const bwipjs = require('bwip-js');

async function generateBarcode(text) {
    return await bwipjs.toBuffer({
        bcid: 'code128',       
        text: text,            
        scale: 3,              
        height: 15,            
        includetext: true,     
        textxalign: 'center',  
        backgroundcolor: 'c4a773', 
        textcolor: '191919',
        rotate: 'L',    
    });
}
async function generateQR(text) {
    return await QRCode.toBuffer(text, {
        type: 'png',
        errorCorrectionLevel: 'H',
        width: 350,
        margin: 1,
        color: {
            dark: '#191919',
            light: '#c4a773'
        }
    });
}

async function generateText(text) {
    const svg = `<svg width="800" height="100" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" font-size="40" fill="#191919" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${text}</text>
    </svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
}

function codeGeneratorFactory(type) {
    switch (type) {
        case 'qr': return generateQR;
        case 'barcode': return generateBarcode;
        case 'text': return generateText;
        default: throw new Error('Invalid ticket type');
    }
}

const codeGenerator = codeGeneratorFactory('qr');

async function generateSVG(text, fontSize) {
    const textToSVG = TextToSVG.loadSync();
    try {
        const svg = textToSVG.getSVG(text, {
            fontSize: fontSize,
            fontFamily: 'Roboto, sans-serif',
            anchor: 'top',
            attributes: { fill: '#ad9267', },
        });
        return Buffer.from(svg);
    } 
    catch (err) {
        console.error('Error generating SVG:', err);
        throw err;
    }
}

async function createTicket(customerName, event, attraction, city, state, ticketId, outputPath) {
    const ticketTemplatePath = path.resolve(__dirname, '../../assets/ticket_template.png');
    const ticket = sharp(ticketTemplatePath);
    
    const qrImageBuffer = await codeGenerator(ticketId);
    const qrOverlay = { input: qrImageBuffer, left: 1620, top: 155};

    const nameImageBuffer = await generateSVG("Name: " + customerName, 40);
    const nameOverlay = { input: nameImageBuffer, top: 140, left: 66};

    const museumImageBuffer = await generateSVG("Attraction: " + attraction.name, 40);
    const museumOverlay = { input: museumImageBuffer, top: 200, left: 66};

    const locationImageBuffer = await generateSVG("Location: " + city + ", " + state, 40);
    const locationOverlay = { input: locationImageBuffer, top: 260, left: 66};

    const exhibitionImageBuffer = await generateSVG("Event: " + event.name, 40);
    const exhibitionOverlay = { input: exhibitionImageBuffer, top: 320, left: 66};

    const validityImageBuffer = await generateSVG("Valid from " + new Date(event.startDate).toLocaleDateString() + " until " + new Date(event.endDate).toLocaleDateString(), 40);
    const validityOverlay = { input: validityImageBuffer, top: 380, left: 66};

    const priceImageBuffer = await generateSVG("Price: $" + event.price, 40);
    const priceOverlay = { input: priceImageBuffer, top: 440, left: 66};

    await ticket.composite([
                qrOverlay,
                nameOverlay,
                museumOverlay,
                locationOverlay,
                exhibitionOverlay,
                validityOverlay,
                priceOverlay
            ])
            .toFile(outputPath);
}

async function addTicket(username, event_id, id) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tickets (username, event_id, id, status) VALUES (?, ?, ?, ?)';
        const status = 'valid';
        const values = [username, event_id, id, status];
        con.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    }
)}

async function validateTicket(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tickets SET status = ? WHERE id = ?';
        const status = 'used';
        con.query(query, [status, ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    }
)}

async function expireTicket(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tickets SET status = ? WHERE id = ?';
        const status = 'expired';
        con.query(query, [status, ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    }
)}

async function getTicket(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tickets WHERE id = ?';
        con.query(query, [ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length == 0) resolve(null);
                else resolve({...result[0]});
            }
        });
    }
)}

async function deleteTicket(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM tickets WHERE id = ?';
        con.query(query, [ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    }
)}

function deleteLocalTicket(ticketPath) {
    try {
        if (fs.existsSync(ticketPath)) {
            fs.unlinkSync(ticketPath);
        } else {
            console.warn(`File not found: ${ticketPath}`);
        }
    } catch (err) {
        console.error(`Error deleting ticket at ${ticketPath}:`, err);
    }
}

module.exports = {
    deleteLocalTicket,
    createTicket,
    addTicket,
    getTicket,
    validateTicket,
    expireTicket,
    deleteTicket
}