const {
  verifyUser,
  verifyAdmin,
  verifyLoggedIn,
} = require("../services/userService");
const {
  getEvents,
  getEventsCount,
  getEventsByAttraction,
  getEventsByAttractionCount,
  getEventsByAttractionAndRange,
  getEventsByRange,
  getEventByID,
  deleteEvent,
  updateEvent,
  addEvent,
  eventNotExist,
  getFilteredEvents,
  getFilteredEventsCount,
  checkEventAlreadyExist,
} = require("../services/eventService");
const {
  attractionNotExists,
  checkAttractionExists,
} = require("../services/attractionService");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  app.get("/api/events", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyUser(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const events = await getEvents();
      res.status(200).json(events);
    } catch (error) {
      console.error("Error retrieving events:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/event/:id", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const events = await getEventByID(req.params.id);
      if (events.length == 0) {
        console.error("Error 401 retrieving the event");
        res.status(401).json("Event not found");
      } else {
        res.status(200).json(events[0]);
      }
    } catch (error) {
      console.error("Error retrieving event:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/event/delete/:id", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const result = await deleteEvent(req.params.id);
      if (result == 0) {
        console.error("Error 401 deleting the event");
        res.status(401).json("Event not found");
      } else {
        res.status(200).send();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.put("/api/event/edit/:id", upload.none(), async (req, res) => {
    const { name, description, price, startDate, endDate, attractionId } =
      req.body;
    const eventId = req.params.id;
    if (
      !name ||
      !description ||
      isNaN(price) ||
      price < 0 ||
      !attractionId ||
      !startDate ||
      !endDate
    ) {
      res.status(401).send("Invalid Input Error");
      return;
    }
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access Denied");
        return;
      }
      const attractionExists = await checkAttractionExists(attractionId);
      if (!attractionExists) {
        res.status(406).send("Attraction Doesn't Exist Error");
        return;
      }
    } catch (error) {
      console.error("Error adding event:", error);
      res.status(500).json("Internal Server Error");
      return;
    }
    try {
      const eventExists = await checkEventAlreadyExist(
        name,
        price,
        startDate,
        endDate,
        attractionId
      );
      if (eventExists) {
        res.status(405).send("Event Exists Error");
        return;
      }
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json("Internal Server Error");
      return;
    }
    try {
      await updateEvent(
        eventId,
        name,
        description,
        price,
        attractionId,
        startDate,
        endDate
      );
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json("Internal Server Error");
      return;
    }
    res.status(200).send("Event Updated Successfully");
  });

  app.post("/api/event/add", upload.none(), async (req, res) => {
    const { name, description, price, startDate, endDate, attractionId } =
      req.body;
    if (
      !name ||
      !description ||
      isNaN(price) ||
      price < 0 ||
      !attractionId ||
      !startDate ||
      !endDate
    ) {
      res.status(401).send("Invalid Input Error");
      return;
    }
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access Denied");
        return;
      }
      const attractionExists = await checkAttractionExists(attractionId);
      if (!attractionExists) {
        res.status(406).send("Attraction Doesn't Exist Error");
        return;
      }
    } catch (error) {
      console.error("Error adding event:", error);
      res.status(500).json("Internal Server Error");
      return;
    }
    try {
      const eventExists = await checkEventAlreadyExist(
        name,
        price,
        startDate,
        endDate,
        attractionId
      );
      if (eventExists) {
        res.status(405).send("Event Exists Error");
        return;
      }
    } catch (error) {
      console.error("Error adding event:", error);
      res.status(500).json("Internal Server Error");
      return;
    }
    try {
      await addEvent(
        name,
        description,
        price,
        attractionId,
        startDate,
        endDate
      );
    } catch (error) {
      console.error("Error adding event:", error);
      res.status(500).json("Internal Server Error");
      return;
    }
    res.status(200).send("Event Added Successfully");
  });

  app.get("/api/events/from/:start/to/:end", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (!userVerification) return res.status(401).send("Access denied");

      const {
        name = "",
        price = 100,
        state = 0,
        city = 0,
        sortopt = "",
      } = req.query;

      const attractionID = req.query.attractionID || null;
      const start = parseInt(req.params.start);
      const end = parseInt(req.params.end);

      const events = await getFilteredEvents(
        attractionID,
        userVerification.role == "admin" ? userVerification.username : null,
        name,
        parseFloat(price),
        parseInt(state),
        parseInt(city),
        sortopt,
        start,
        end
      );

      res.status(200).json(events);
    } catch (err) {
      console.error("Error retrieving filtered events:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/events/count", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (!userVerification) return res.status(401).send("Access denied");

      const { name = "", price = 100, state = 0, city = 0 } = req.query;

      const attractionID = req.query.attractionID || null;

      const count = await getFilteredEventsCount(
        attractionID,
        userVerification.role == "admin" ? userVerification.username : null,
        name,
        parseFloat(price),
        parseInt(state),
        parseInt(city)
      );

      res.status(200).json(count);
    } catch (err) {
      console.error("Error counting filtered events:", err);
      res.status(500).send("Internal Server Error");
    }
  });
};
