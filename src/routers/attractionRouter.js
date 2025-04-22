const { getAttractions, getAttractionByID, deleteAttraction, updateAttraction, addAttraction, getAttractionsByRangeWithFilters, getAttractionsCountWithFilters } = require('../services/attractionService');
const { verifyLoggedIn } = require('../services/userService');

module.exports = (app) => {

    app.get("/api/attractions", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const attractions = await getAttractions();
            
            res.status(200).json(attractions);
        } catch (error) {
            console.error('Error retrieving attractions:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.get("/api/attractions/from/:start/to/:end/", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const { sortingOption, name, theme, state, city, minimumRating } = req.query;
            const attractions = await getAttractionsByRangeWithFilters((userVerification.role == 'admin' ? userVerification.username : null), req.params.start, req.params.end, sortingOption, name, theme, state, city, minimumRating);
            res.status(200).json(attractions);
        } catch (error) {
            console.error('Error retrieving attractions:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.get("/api/attractions/count", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const { name, theme, state, city, minimumRating } = req.query;
            const count = await getAttractionsCountWithFilters((userVerification.role == 'admin' ? userVerification.username : null), name, theme, state, city, minimumRating);
            res.status(200).json(count);
        } catch (error) {
            console.error('Error retrieving attractions:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.get("/api/attraction/:id", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const attraction = await getAttractionByID(req.params.id);
            if (attraction.length === 0) {
                res.status(404).json("Attraction not found");
            } else {
                res.status(200).json(attraction[0]);
            }
        } catch (error) {
            console.error('Error retrieving attraction:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.delete("/api/attraction/delete/:id", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const result = await deleteAttraction(req.params.id);
            if (result === 0) {
                res.status(404).json("Attraction not found");
            } else {
                res.status(200).send();
            }
        } catch (error) {
            console.error('Error deleting attraction:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.put("/api/attraction/edit/:id", async (req, res) => {
        const attractionID = parseInt(req.params.id);
        const { name, city, latitude, longitude, revenue, theme, rating, photo_path } = req.body;
        if (name == null || city == null || latitude == null || longitude == null || revenue == null || theme == null || rating == null || photo_path == null) {
            res.status(400).send('All fields are required');
            return;
        }
        if (isNaN(attractionID) || attractionID < 0) {
            res.status(400).send('Invalid ID error');
            return;
        }

        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            await updateAttraction(attractionID, name, city, latitude, longitude, revenue, theme, rating, photo_path);
            res.status(200).send('Attraction updated successfully');
        } catch (error) {
            console.error('Error updating attraction:', error);
            res.status(500).json('Internal Server Error');
        }
    });



    app.post("/api/attraction/add", async (req, res) => {
        const { name, city, latitude, longitude, revenue, theme, rating, photo_path } = req.body;
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            await addAttraction(name, city, latitude, longitude, revenue, theme, rating, photo_path);
            res.status(200).send('Attraction added successfully');
        } catch (error) {
            console.error('Error adding attraction:', error);
            res.status(500).json('Internal Server Error');
        }
    });



    app.get("/api/attractions/closest", async (req, res) => {
        const {latitude, longitude, max_distance, min_rating, nr_attractions} = req.query;
        if (!latitude || !longitude) return res.status(400).send('Invalid coordinates');
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const attractions = await getAttractions();
            var selected_attractions = [];
            for (index in attractions) {
                const a_latitude = attractions[index].latitude;
                const a_longitude = attractions[index].longitude;

                const R = 6371e3; // metres
                const φ1 = latitude * Math.PI/180; // φ, λ in radians
                const φ2 = a_latitude * Math.PI/180;
                const Δφ = (a_latitude-latitude) * Math.PI/180;
                const Δλ = (a_longitude-longitude) * Math.PI/180;

                const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ/2) * Math.sin(Δλ/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const d = R * c; 
                if (d <= max_distance*1000/2.2 && attractions[index].rating >= min_rating) {
                    selected_attractions.push(attractions[index]);
                }
            }
            if (selected_attractions.length > nr_attractions) selected_attractions = selected_attractions.slice(0, nr_attractions);
            res.status(200).json(selected_attractions);
        } catch (error) {
            console.error('Error retrieving attractions:', error);
            res.status(500).json('Internal Server Error');
        }
    });




    app.get("/api/attractions/count", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const attractions = await getAttractions();
            if (attractions.length === 0) {
                res.status(404).json("Attractions not found");
            } else {
                res.status(200).json(attractions.length);
            }
        } catch (error) {
            console.error('Error retrieving attraction:', error);
            res.status(500).send('Internal Server Error');
        }
    });

}