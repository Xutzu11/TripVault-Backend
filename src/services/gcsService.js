// file: services/uploadService.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Update the path to your service account key
const keyFilename = path.join(__dirname, '../../configs/bucket.json');
const storage = new Storage({ keyFilename });
const bucket = storage.bucket('tripvault');

const uploadFileToGCS = async (file) => {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(`tickets/${uuidv4()}-${file.originalname}`);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            try {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/tickets/${blob.name}`;
                resolve(publicUrl);
            } catch (err) {
                reject(err);
            }
        });

        blobStream.end(file.buffer);
    });
};

module.exports = { uploadFileToGCS };
