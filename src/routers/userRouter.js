const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { getUser, createUser, getUsers, getUserByID, updateUser, userAlreadyExists, userNotExists } = require('../services/userService');
const { verifyUser, verifyAdmin, verifyLoggedIn } = require('../services/userService');

module.exports = (app) => {

    app.get("/api/login/:username/:password", async (req, res) => {
        try {
            const Username = req.params.username;
            const Password = req.params.password;
            const user = await getUser(Username);
            if (user == null) {
                res.status(401).send('Username doesn\'t exist.');
                return;
            }
            const ActualPassword = user.password;
            bcrypt.compare(Password, ActualPassword, function(err, result) {
                if (err) {
                    console.log('Error hashing: ', err);
                    return;
                }
                if (!result) {
                    res.status(402).send('Password is incorrect.');
                }
                else {
                    const token = jwt.sign(user, user.role, {expiresIn: '30m',});
                    res.status(200).send(token);
                }
            });
        } catch (error) {
            console.error('Error retrieving user:', error);
            res.status(500).send('Internal Server Error');
        }
    })

    app.post("/api/register", async (req, res) => {
        const { Username, FirstName, LastName, Email, Password, Role } = req.body;
        const user = await getUser(Username);
        bcrypt.hash(Password, saltRounds)
        .then(HashedPass => {
            if (user != null) {
                return Promise.reject(401);
            }
            return createUser(Username, FirstName, LastName, Email, Role, HashedPass); 
        })
        .then(() => {
            res.status(200).send('Account created successfully');
        })
        .catch(err => {
            if (err === 401) {
                res.status(401).send('User already exists.');
                return;
            }
            console.error('Error creating user:', err);
            res.status(500).send('Internal Server Error');
        });
    })

    app.get("/api/access/admin", async (req, res) => {
        const token = req.header('Authorization');
        const userVerification = await verifyAdmin(token);
        if (userVerification != null) {
            res.status(200).send(userVerification);
        }
        else res.status(401).send('Access denied');
    })

    app.get("/api/access/user", async (req, res) => {
        const token = req.header('Authorization');
        const userVerification = await verifyUser(token);
        if (userVerification != null) {
            res.status(200).send(userVerification);
        }
        else res.status(401).send('Access denied');
    })

    app.get("/api/access", async (req, res) => {
        const token = req.header('Authorization');
        const userVerification = await verifyLoggedIn(token);
        if (userVerification != null) {
            res.status(200).send(userVerification);
        }
        else res.status(401).send('Access denied');
    })

    app.get("/api/users", async (req, res) => {
        try {
            const users = await getUsers();
            res.status(200);
            res.json(users);
        } catch (error) {
            console.error('Error retrieving users:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get("/api/user/:id", async (req, res) => {
        try {
            const users = await getUserByID(req.params.id);
            if (users.length === 0) {
                console.error('Error 401 retrieving the user');
                res.status(401).json("User not found");
            } else {
                res.status(200);
                res.json(users[0]);
            }
        } catch (error) {
            console.error('Error retrieving user:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.put("/api/user/edit/:id", async (req, res) => {
        const userID = parseInt(req.params.id);
        const { username, fname, lname, email, role } = req.body;

        if (isNaN(userID) || userID < 0) {
            res.status(400).send('Invalid ID error');
            return;
        }
        if (!username || !fname || !lname || !email || !role) {
            res.status(400).send('All fields are required');
            return;
        }

        try {
            const exists = await userAlreadyExists(username, email, userID);
            if (exists) {
                res.status(409).send('User with the same username or email already exists');
                return;
            }
        } catch (error) {
            console.error('Error checking if user exists:', error);
            res.status(500).json('Internal Server Error');
            return;
        }

        try {
            const notExists = await userNotExists(userID);
            if (notExists) {
                res.status(404).send('User does not exist');
                return;
            }
        } catch (error) {
            console.error('Error checking if user does not exist:', error);
            res.status(500).json('Internal Server Error');
            return;
        }

        try {
            await updateUser(userID, username, fname, lname, email, role);
            res.status(200).send('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json('Internal Server Error');
        }
    });

}