const ner = require('../../configs/ner.json');
const con = require('../database/db');
const { verifyLoggedIn } = require('../services/userService');
const axios = require('axios');

module.exports = (app) => {
    app.get('/api/path/prompt', async (req, res) => {
        try {
            const token = req.header("Authorization");
            const userVerification = await verifyLoggedIn(token);
            if (!userVerification) {
                return res.status(401).send("Access denied");
            }

            const userPrompt = req.query.prompt;
            const response = await axios.post(`${ner.SERVER}/internal/extract-filters`, {
                prompt: userPrompt
            });

            var address = '';
            if (response.data.address != null) {
                address += response.data.address + ', ';
            }
            if (response.data.location != null) {
                if (response.data.location.city) {
                    address += response.data.location.city + ', ';
                } 
                if (response.data.location.state) {
                    address += response.data.location.state + ', ';
                }
            }
            
            const filters = {
                address: address,
                attractions: response.data.number_of_attractions,
                transport: response.data.transport,
                distance: response.data.max_distance,
                time: response.data.max_time,
            };
            console.log(filters);
            res.status(200).json(filters);

        } catch (error) {
            console.error("Error retrieving filters:", error.message);
            res.status(500).send("Internal Server Error");
        }
    });
}