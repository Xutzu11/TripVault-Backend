const ner = require('../../configs/ner.json');
const con = require('../database/db');
const { verifyLoggedIn } = require('../services/userService');
const { getAttractionsWithMinPrice } = require('../services/attractionService');
const axios = require('axios');
const haversine = require('haversine-distance');

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
                price: response.data.max_price,
                rating: response.data.min_rating,
                time: response.data.max_time,
            };
            res.status(200).json(filters);
        } catch (error) {
            console.error("Error retrieving filters:", error.message);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get("/api/path/optimal", async (req, res) => {
        const { latitude, longitude, max_distance, min_rating, max_price, nr_attractions } = req.query;
        if (!latitude || !longitude)
            return res.status(400).send("Invalid coordinates");
        const SCALE = 2.2; // distance, price, rating scale
        try {
            /*const token = req.header("Authorization");
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send("Access denied");
                return;
            }*/
            const start_point = {
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
            }
            const attractions = await getAttractionsWithMinPrice();
            var selected_attractions = [];
            let price = parseFloat(max_price) || 1000; // default = 1000 dollars
            let rating = parseFloat(min_rating) || 0; // default = 0 rating
            let nr_attr = parseInt(nr_attractions) || 9; // default = 9 attractions
            let distance = parseFloat(max_distance) || 10; // default = 10 km
            for (index in attractions) {
                const next_point = {
                    lat: parseFloat(attractions[index].latitude),
                    lon: parseFloat(attractions[index].longitude),
                }; 
                if (
                    haversine(start_point, next_point) <= (distance * 1000) / SCALE &&
                    attractions[index].rating >= rating - SCALE &&
                    attractions[index].price <= (price / nr_attr) / SCALE
                ) {
                    selected_attractions.push({
                        id: attractions[index].id,
                        name: attractions[index].name,
                        latitude: parseFloat(attractions[index].latitude),
                        longitude: parseFloat(attractions[index].longitude),
                        price: parseFloat(attractions[index].price),
                        rating: parseFloat(attractions[index].rating)
                    });
                }
            }
            const response = await axios.post(`${ner.SERVER}/internal/optimal-path`, {
                start_point: {
                    latitude: start_point.lat,
                    longitude: start_point.lon
                },
                max_distance: distance,
                min_rating: rating,
                max_price: price,
                nr_attractions: nr_attr,
                attractions: selected_attractions
            });
            if (response.data.best_attractions === null) {
                return res.status(404).json("No attractions found");
            }
            res.status(200).json(response.data.best_attractions);
            } catch (error) {
                console.error("Error retrieving attractions:", error);
                res.status(500).json("Internal Server Error");
            }
        }
    );
}