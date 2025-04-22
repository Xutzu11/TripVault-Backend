// file: routes/uploadRoutes.js
const multer = require('multer');
const { uploadFileToGCS } = require('../services/gcsService');

const upload = multer({ storage: multer.memoryStorage() });

module.exports = (app) => {
    app.post('/api/upload', upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }

            const publicUrl = await uploadFileToGCS(req.file);
            res.status(200).json({ url: publicUrl });

        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).send('Internal Server Error');
        }
    });
};
