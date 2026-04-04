## Ecommerce Backend

Node.js / Express backend for an ecommerce application, using MongoDB (via Mongoose) for persistence and JWT-based authentication. It exposes RESTful APIs for authentication, products, orders, users, and cart management.

### Tech Stack

- **Runtime**: Node.js (ES modules)
- **Framework**: Express
- **Database**: MongoDB with Mongoose
- **Auth**: JSON Web Tokens (JWT), `bcrypt`
- **Security & Middleware**: `helmet`, `cors`, `hpp`, `express-rate-limit`, `morgan`
- **Other**: `multer` (file uploads), `nodemailer` (emails), `cloudinary` (media)

### Project Structure (simplified)

- **`server/server.js`**: Application entry point, middleware setup, route mounting, and DB connection.
- **`server/src/config`**: Database and CORS configuration.
- **`server/src/features/auth`**: Auth routes (login/register/etc).
- **`server/src/features/products`**: Product routes and logic.
- **`server/src/features/orders`**: Order management.
- **`server/src/features/users`**: User management.
- **`server/src/features/cart`**: Cart operations.
- **`server/src/shared/middleware`**: Error handling, rate limiting, and other shared middleware.

### Prerequisites

- **Node.js**: v18+ recommended
- **npm** or **yarn**
- **MongoDB** instance (local or hosted, e.g. Atlas)

### Installation

```bash
cd server
npm install
```

### Environment Configuration

Create a `.env` file in `server/src` (or update the existing one) with the required keys. Typical values for this project might look like:

```bash
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=3010
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.example.com
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> **Note**: Keep `.env` out of version control and never commit real secrets.

#### MongoDB `querySrv ECONNREFUSED` (Atlas + `mongodb+srv`)

If you see `querySrv ECONNREFUSED` for `_mongodb._tcp.*.mongodb.net`, your network or DNS resolver is blocking or mishandling **SRV** lookups used by `mongodb+srv://`.

The app’s `server/src/config/db.js` switches Node’s DNS to public resolvers (`8.8.8.8`, etc.) before connecting, which fixes many home/ISP setups.

If it still fails:

1. In **MongoDB Atlas** → **Connect** → **Drivers**, choose the **standard** connection string (`mongodb://host:27017,...`) instead of SRV.
2. Add to `.env` as **`MONGO_URI_STANDARD=...`** (this overrides `MONGO_URI` for the connection).
3. To disable the DNS tweak, set **`MONGO_SKIP_DNS_FIX=true`**.

### Running the Server

- **Development (with auto-reload)**:

```bash
cd server
npm run dev
```

- **Production**:

```bash
cd server
npm start
```

By default, the server listens on `http://localhost:3010` (or the value of `PORT` in `.env`).

### API Overview

All APIs are prefixed with `/api`, and most feature routes are versioned under `/api/v1`.

- **Auth**: `POST /api/v1/auth/...` – registration, login, logout, token refresh, etc.
- **Products**: `GET/POST/PUT/DELETE /api/v1/products` – product catalog CRUD and queries.
- **Orders**: `GET/POST /api/v1/orders` – place and view orders.
- **Users**: `GET/PUT /api/v1/users` – user profile and admin user management.
- **Cart**: `GET/POST/PUT/DELETE /api/v1/cart` – manage the user’s shopping cart.

> **Note**: Exact endpoints and payloads are defined in the route and controller files under `server/src/features/*/routes`.

### Middleware & Security

- **Rate Limiting**: All `/api` routes are protected by an `apiLimiter`, and auth routes use an additional `authLimiter`.
- **CORS**: Configured via `corsOptions` in `src/config/cors.js`.
- **Security Headers**: Enabled via `helmet`.
- **Input Safety**: `hpp` protects against HTTP parameter pollution.
- **Logging**: Requests are logged in development mode via `morgan`.

### Scripts

Defined in `server/package.json`:

- **`npm run dev`**: Run the server with `nodemon` for development.
- **`npm start`**: Run the server with Node for production.

### How to Run for a Submission / Demo

1. **Clone or unzip** the project into a folder (e.g. `ecommerce-backend`).
2. **Install dependencies** inside the `server` folder with `npm install`.
3. **Configure environment** variables in `server/src/.env` (at minimum `MONGODB_URI`, `PORT`, `JWT_SECRET`).
4. **Start MongoDB** locally or ensure your remote cluster is reachable.
5. **Run `npm run dev`** (or `npm start`) from the `server` directory.
6. Access the API using a REST client (Postman/Insomnia) or a frontend app at `http://localhost:3010/api/v1/...`.

### License

This project is licensed under the **ISC** license (see `server/package.json`).
