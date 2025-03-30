const { getStates, getCitiesByState } = require('../services/locationService');

module.exports = (app) => {

    app.get("/api/cities", async (req, res) => {
        try {
            const state = req.query.state;
            const cities = await getCitiesByState(state);
            res.status(200);
            res.json(cities);
        } catch (error) {
            console.error('Error retrieving cities:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get("/api/states", async (req, res) => {
        try {
            const states = await getStates();
            res.status(200);
            res.json(states);
        } catch (error) {
            console.error('Error retrieving states:', error);
            res.status(500).send('Internal Server Error');
        }
    });

}