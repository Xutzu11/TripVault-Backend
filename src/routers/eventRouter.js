const { verifyUser, verifyAdmin, verifyLoggedIn } = require('../services/userService');
const { getEvents, getEventsCount, getEventsByAttraction, getEventsByAttractionCount, getEventsByAttractionAndRange, getEventsByRange, getEventByID, deleteEvent, updateEvent, addEvent, eventNotExist, getFilteredEvents, getFilteredEventsCount } = require('../services/eventService');
const { attractionNotExists } = require('../services/attractionService');

module.exports = (app) => {

    app.get("/api/events", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const events = await getEvents();
            res.status(200).json(events);
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.get("/api/events-attraction/:attractionID", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const events = await getEventsByAttraction(req.params.attractionID);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get("/api/events-attraction/count/:attractionID", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const [result] = await getEventsByAttractionCount(req.params.attractionID);
            res.status(200).json(result.count);
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get("/api/events-attraction/:id/from/:start/to/:end", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const events = await getEventsByAttractionAndRange(req.params.id, req.params.start, req.params.end);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).send('Internal Server Error');
        }
    });



    app.get("/api/event/:id", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const events = await getEventByID(req.params.id);
            if (events.length == 0) {
                console.error('Error 401 retrieving the event');
                res.status(401).json("Event not found");
            } else {
                res.status(200).json(events[0]);
            }
        } catch (error) {
            console.error('Error retrieving event:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.delete("/api/event/delete/:id", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const result = await deleteEvent(req.params.id);
            if (result == 0) {
                console.error('Error 401 deleting the event');
                res.status(401).json("Event not found");
            } else {
                res.status(200).send();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    async function eventAlreadyExist(id, name, attraction_id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM events WHERE name = ? AND attraction_id = ? AND id != ?';
            con.query(query, [name, attraction_id, id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.length !== 0);
                }
            });
        });
    }

    app.put("/api/event/edit/:id", async (req, res) => {
        const { name, description, price, attraction_id, start_date, end_date } = req.query;
        const event_id = parseInt(req.params.id);
        if (isNaN(event_id) || event_id < 0) {
            console.error('Error 400 updating the event:');
            res.status(400).send('Invalid ID error');
            return;
        }
        if (!name || !description || isNaN(price) || price < 0 || !attraction_id || !start_date || !end_date) {
            console.error('Error 401 updating the event');
            res.status(401).send('Invalid input error');
            return;
        }
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const attractionExists = await attractionNotExists(attraction_id);
            if (attractionExists) {
                console.error('Error 405 updating the event');
                res.status(405).send('Attraction doesn\'t exist error');
                return;
            }
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        try {
            const eventExists = await eventAlreadyExist(event_id, name, attraction_id);
            if (eventExists) {
                console.error('Error 406 updating the event');
                res.status(406).send('Event exists error');
                return;
            }
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        try {
            const eventNotExists = await eventNotExist(event_id);
            if (eventNotExists) {
                console.error('Error 407 updating the event');
                res.status(407).send('Event doesn\'t exist error');
                return;
            }
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        try {
            await updateEvent(event_id, name, description, price, attraction_id, start_date, end_date);
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        res.status(200).send('Event updated successfully');
    });

    app.post("/api/event/add", async (req, res) => {
        const { name, description, price, attraction_id, start_date, end_date } = req.query;
        if (!name || !description || isNaN(price) || price < 0 || !attraction_id || !start_date || !end_date) {
            console.error('Error 401 adding the event');
            res.status(401).send('Invalid input error');
            return;
        }
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyUser(token);
            if (userVerification == null) {
                res.status(401).send('Access denied');
                return;
            }
            const attractionExists = await attractionNotExists(attraction_id);
            if (attractionExists) {
                console.error('Error 406 adding the event');
                res.status(406).send('Attraction doesn\'t exist error');
                return;
            }
        } catch (error) {
            console.error('Error adding events:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        try {
            const eventExists = await eventAlreadyExist(0, name, attraction_id);
            if (eventExists) {
                console.error('Error 405 adding the event');
                res.status(405).send('Event exists error');
                return;
            }
        } catch (error) {
            console.error('Error adding events:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        try {
            await addEvent(name, description, price, attraction_id, start_date, end_date);
        } catch (error) {
            console.error('Error adding event:', error);
            res.status(500).json('Internal Server Error');
            return;
        }
        res.status(200).send('Event added successfully');
    });

    app.get("/api/events/from/:start/to/:end", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (!userVerification) return res.status(401).send("Access denied");
    
            const {
                name = '',
                price = 100,
                state = 0,
                city = 0,
                sortopt = '',
            } = req.query;
    
            const start = parseInt(req.params.start);
            const end = parseInt(req.params.end);
    
            const events = await getFilteredEvents(
                (userVerification.role == 'admin' ? userVerification.username : null),
                name,
                parseFloat(price),
                parseInt(state),
                parseInt(city),
                sortopt,
                start,
                end,
            );
    
            res.status(200).json(events);
        } catch (err) {
            console.error('Error retrieving filtered events:', err);
            res.status(500).send('Internal Server Error');
        }
    });
    
    app.get("/api/events/count", async (req, res) => {
        try {
            const token = req.header('Authorization');
            const userVerification = await verifyLoggedIn(token);
            if (!userVerification) return res.status(401).send("Access denied");
    
            const {
                name = '',
                price = 100,
                state = 0,
                city = 0,
            } = req.query;
    
            const count = await getFilteredEventsCount(
                (userVerification.role == 'admin' ? userVerification.username : null),
                name,
                parseFloat(price),
                parseInt(state),
                parseInt(city),
            );
    
            res.status(200).json(count);
        } catch (err) {
            console.error('Error counting filtered events:', err);
            res.status(500).send('Internal Server Error');
        }
    });    
}