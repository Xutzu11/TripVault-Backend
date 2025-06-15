# TripVault Node.js Backend

This repository contains the **Node.js backend** for the TripVault platform. It acts as the main server for handling:

- 🔐 User authentication and role-based access
- 📍 Attractions, events, and location management
- 🎫 Ticket generation and validation
- 💳 Stripe-based payment processing
- 📧 Email notification and ticket delivery
- ☁️ Google Cloud Storage (GCS) file management
- 🔄 Communication with the Python microservice for prompt parsing and path computation

---

## ⚙️ Configuration

There needs to be an environment file in root project:

### 🔑 `.env` file (environment variables)

```
BASE_URL=https://tripvault-frontend.vercel.app
```

Used for redirections after login or payment success.

The backend then expects several config files located in a `config/` folder:

### 🗄 Database: `dbconfig.json`

```json
{
  "HOST": "YOUR_HOST",
  "USER": "YOUR_USER",
  "PASSWORD": "YOUR_PASSWORD",
  "DATABASE": "YOUR_DATABASE",
  "PORT": "YOUR_PORT"
}
```

### ☁️ Google Cloud Storage: `gcs.json` and `bucket.json`

`gcs.json` — Full service account credentials  
`bucket.json` — Defines bucket names and base access URL:

```json
{
  "ATTRACTIONS_BUCKET_NAME": "YOUR_ATTRACTIONS_BUCKET_NAME",
  "TICKETS_BUCKET_NAME": "YOUR_TICKETS_BUCKET_NAME",
  "BASE_URL": "https://storage.googleapis.com"
}
```

### 📬 Email Service: `email.json`

```json
{
  "SERVICE": "YOUR_EMAIL_SERVICE",
  "USER": "YOUR_EMAIL",
  "PASS": "YOUR_PASSWORD"
}
```

Used for sending order summaries and tickets.

### 💳 Stripe API Keys: `stripe.json`

```json
{
  "PUBLISHABLE_KEY": "YOUR_PUBLISHABLE_KEY",
  "PRIVATE_KEY": "YOUR_PRIVATE_KEY"
}
```

### 🤖 NER Microservice: `ner.json`

```json
{
  "SERVER": "http://localhost:8000"
}
```

Defines the endpoint of the Python microservice used for prompt parsing.

---

## ▶️ Running the Server

```bash
npm install
node server.js
```

The server runs on the port defined in your code (commonly `3000` or `8080`) and exposes REST API endpoints.

---

## 📄 License

This backend is part of the **TripVault** thesis project. Usage and modification may be subject to academic licensing or supervisor approval.

---

## 👤 Author

**Alex-Matei Ignat**  
BSc Computer Science, 2025  
Babeș-Bolyai University
