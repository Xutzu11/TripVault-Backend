const sharp = require('sharp')
const QRCode = require('qrcode');
const TextToSVG = require('text-to-svg');
const path = require('path');

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

async function createTicket(customerName, event, attraction, ticketId, outputPath) {
    const ticketTemplatePath = path.resolve(__dirname, '../../assets/ticket_template.png');
    const ticket = sharp(ticketTemplatePath);
    
    const qrImageBuffer = await generateQR(ticketId);
    const qrOverlay = { input: qrImageBuffer, left: 1620, top: 155};

    const nameImageBuffer = await generateSVG("Name: " + customerName, 40);
    const nameOverlay = { input: nameImageBuffer, top: 140, left: 66};

    const museumImageBuffer = await generateSVG("Attraction: " + attraction.name, 40);
    const museumOverlay = { input: museumImageBuffer, top: 200, left: 66};

    const locationImageBuffer = await generateSVG("Location: " + attraction.state + ", " + attraction.city, 40);
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

function mailContent(userName, itemsWithAttractions) {
    let message = `<h1>Order Confirmation</h1>`;
    message += `<p>Dear ${userName},</p>`;
    message += `<p>Thank you for your purchase! Here is the summary of your order:</p>`;
    message += `<ul>`;
    itemsWithAttractions.forEach(({item, attraction}) => {
        message += `<li>
                        <strong>${item.event.name}, at ${attraction.name}</strong><br>
                        ${item.event.description}<br>
                        <img src="${attraction.photoPath}" alt="${item.event.name}" style="width: 100px; height: auto;"><br>
                        Quantity: ${item.quantity}<br>
                        Total Price: $${(item.quantity * item.event.price).toFixed(2)}<br>
                        <p style="font-style: italic;">Available from ${new Date(item.event.startDate).toLocaleDateString()} until ${new Date(item.event.endDate).toLocaleDateString()}</p>
                    </li><br>`;
    });
    message += `</ul>`;
    message += `<p>Total amount: $${itemsWithAttractions.reduce((acc, {item, attraction}) => acc + item.quantity * item.event.price, 0).toFixed(2)}</p>`;
    message += '<strong>You will find the tickets attached to this email.</strong><br><br>'
    message += `<p>We hope you enjoy the events!</p>`;
    message += `<p style="font-style: italic;">Best regards,<br>Alex Ignat from Attractions Team</p><br>`;
    message += '<img src="https://i.ibb.co/1f1WgXs/logo.png" alt="Logo" style="width: 100px; height: auto;">'
    message += `<br><br><br><p style="font-size: 10px;">This is an automatically generated email. Please do not reply to it.</p>`;
    return message;
}

module.exports = {
    mailContent,
    createTicket
}