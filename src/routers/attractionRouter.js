const {
  getAttractions,
  getAttractionByID,
  deleteAttraction,
  updateAttraction,
  addAttraction,
  getAttractionsByRangeWithFilters,
  getAttractionsCountWithFilters,
} = require("../services/attractionService");
const { verifyLoggedIn, verifyAdmin } = require("../services/userService");
const { uploadAttractionToGCS } = require("../services/gcsService");
const multer = require("multer");
const { checkCityExists, getStateByCityID } = require("../services/locationService");
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (app) => {
  app.get("/api/attractions", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const attractions = await getAttractions();

      res.status(200).json(attractions);
    } catch (error) {
      console.error("Error retrieving attractions:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/attractions/from/:start/to/:end/", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const { sortingOption, name, theme, state, city, minimumRating } =
        req.query;
      const attractions = await getAttractionsByRangeWithFilters(
        userVerification.role == "admin" ? userVerification.username : null,
        req.params.start,
        req.params.end,
        sortingOption,
        name,
        theme,
        state,
        city,
        minimumRating
      );
      res.status(200).json(attractions);
    } catch (error) {
      console.error("Error retrieving attractions:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/attractions/count", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const { name, theme, state, city, minimumRating } = req.query;
      const count = await getAttractionsCountWithFilters(
        userVerification.role == "admin" ? userVerification.username : null,
        name,
        theme,
        state,
        city,
        minimumRating
      );
      res.status(200).json(count);
    } catch (error) {
      console.error("Error retrieving attractions:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/attraction/:id", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const attraction = await getAttractionByID(req.params.id);
      if (attraction.length === 0) {
        res.status(404).json("Attraction not found");
      } 
      const state = await getStateByCityID(attraction[0].city_id);
      if (state.length === 0) {
        res.status(404).json("State not found");
      } else {
        attraction[0].state = state[0].id;
      }
      res.status(200).json(attraction[0]);
    } catch (error) {
      console.error("Error retrieving attraction:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/attraction/delete/:id", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const result = await deleteAttraction(req.params.id);
      if (result === 0) {
        res.status(404).json("Attraction not found");
      } else {
        res.status(200).send();
      }
    } catch (error) {
      console.error("Error deleting attraction:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.put("/api/attraction/edit/:id", upload.single("photo"), async (req, res) => {
    const { name, theme, revenue, rating, city_id, latitude, longitude } =
      req.body;
    const photo = req.file;
    if (
      !name ||
      !theme ||
      isNaN(revenue) ||
      revenue < 0 ||
      isNaN(rating) ||
      rating < 1 ||
      rating > 5 ||
      !city_id ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      res.status(401).send("Invalid Input Error");
      return;
    }

    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }

      const cityExists = await checkCityExists(city_id);
      if (!cityExists) {
        res.status(406).send("City Doesn't Exist Error");
        return;
      }

      const photo_path = (photo) ? await uploadAttractionToGCS(photo) : null;
      await updateAttraction(
        req.params.id,
        name,
        theme,
        parseFloat(revenue),
        parseFloat(rating),
        city_id,
        parseFloat(latitude),
        parseFloat(longitude),
        photo_path
      );

      res.status(200).send("Attraction added successfully");
    } catch (error) {
      console.error("Error adding attraction:", error);
      res.status(500).json("Internal Server Error");
    }
  });

  app.post("/api/attraction/add", upload.single("photo"), async (req, res) => {
    const { name, theme, revenue, rating, city_id, latitude, longitude } =
      req.body;
    const photo = req.file;
    if (
      !name ||
      !theme ||
      isNaN(revenue) ||
      revenue < 0 ||
      isNaN(rating) ||
      rating < 1 ||
      rating > 5 ||
      !city_id ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      !photo
    ) {
      res.status(401).send("Invalid Input Error");
      return;
    }

    try {
      const token = req.header("Authorization");
      const userVerification = await verifyAdmin(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }

      const cityExists = await checkCityExists(city_id);
      if (!cityExists) {
        res.status(406).send("City Doesn't Exist Error");
        return;
      }

      const photo_path = await uploadAttractionToGCS(photo);
      await addAttraction(
        userVerification.username,
        name,
        theme,
        parseFloat(revenue),
        parseFloat(rating),
        city_id,
        parseFloat(latitude),
        parseFloat(longitude),
        photo_path
      );

      res.status(200).send("Attraction added successfully");
    } catch (error) {
      console.error("Error adding attraction:", error);
      res.status(500).json("Internal Server Error");
    }
  });

  app.get("/api/attractions/count", async (req, res) => {
    try {
      const token = req.header("Authorization");
      const userVerification = await verifyLoggedIn(token);
      if (userVerification == null) {
        res.status(401).send("Access denied");
        return;
      }
      const attractions = await getAttractions();
      if (attractions.length === 0) {
        res.status(404).json("Attractions not found");
      } else {
        res.status(200).json(attractions.length);
      }
    } catch (error) {
      console.error("Error retrieving attraction:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};
