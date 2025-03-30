const bwipjs = require('bwip-js')
const sharp = require('sharp')

async function generateBarcode(text) {
    let svg = bwipjs.toSVG({
        bcid: 'code128', // Barcode type
        text, // Text to encode
        width: 80,
        textxalign: 'center', // Always good to set this
        textcolor: 'ff0000', // Red text
        rotate: 'L',
    });
    return Buffer.from(svg);
}

async function createTicket(customerName, exhibition, museum, ticketId, outputPath) {
    const ticketTemplatePath = path.join(
        __dirname,
        './sample_ticket.png'
    );
    const ticket = sharp(ticketTemplatePath);
    
    const barcodeImageBuffer = await generateBarcode(ticketId);
    const barcodeOverlay = { input: barcodeImageBuffer, left: 1720, top: 96};

    const nameImageBuffer = await generateSVG("Name: " + customerName, 40);
    const nameOverlay = { input: nameImageBuffer, top: 140, left: 66};

    const museumImageBuffer = await generateSVG("Museum: " + museum.name, 40);
    const museumOverlay = { input: museumImageBuffer, top: 200, left: 66};

    const locationImageBuffer = await generateSVG("Location: " + museum.city + ", " + museum.country, 40);
    const locationOverlay = { input: locationImageBuffer, top: 260, left: 66};

    const exhibitionImageBuffer = await generateSVG("Exhibition: " + exhibition.name, 40);
    const exhibitionOverlay = { input: exhibitionImageBuffer, top: 320, left: 66};

    const validityImageBuffer = await generateSVG("Valid from " + new Date(exhibition.start_date).toLocaleDateString() + " until " + new Date(exhibition.end_date).toLocaleDateString(), 40);
    const validityOverlay = { input: validityImageBuffer, top: 380, left: 66};

    const priceImageBuffer = await generateSVG("Price: $" + exhibition.price, 40);
    const priceOverlay = { input: priceImageBuffer, top: 440, left: 66};

    await ticket.composite([
                barcodeOverlay,
                nameOverlay,
                museumOverlay,
                locationOverlay,
                exhibitionOverlay,
                validityOverlay,
                priceOverlay
            ])
            .toFile(outputPath);
}

module.exports = {
    generateBarcode,
    createTicket
};