// file: services/uploadService.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {loadConfig, resolveFilePath} = require('../../utils/configPathResolve.js');
const buckets = loadConfig('bucket.json');
const fs = require('fs');
const keyFilename = resolveFilePath('gcs.json');
const storage = new Storage({ keyFilename });
const ticketBucket = storage.bucket(buckets.TICKETS_BUCKET_NAME);
const attractionBucket = storage.bucket(buckets.ATTRACTIONS_BUCKET_NAME);
const os = require('os');

const uploadTicketToGCS = async (file) => {
    return new Promise((resolve, reject) => {
        const blob = ticketBucket.file(`${file.originalname}`);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', () => {
            const publicUrl = `${buckets.BASE_URL}/${ticketBucket.name}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

const uploadTicketToLocal = async (file) => {
    return new Promise((resolve, reject) => {
        const outputPath = path.resolve(os.tmpdir(), `{file.originalname}.png`);

        fs.writeFile(outputPath, file.buffer, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(outputPath);
            }
        });
    });
};

const uploadAttractionToGCS = async (file) => {
    return new Promise((resolve, reject) => {
        const blob = attractionBucket.file(`${uuidv4()}.jpg`);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            resolve(blob.name);
        });

        blobStream.end(file.buffer);
    });
};

const uploadTicketStrategies = {
    gcs: uploadTicketToGCS,
    local: uploadTicketToLocal,
};

module.exports = { uploadTicketStrategies, uploadAttractionToGCS };
