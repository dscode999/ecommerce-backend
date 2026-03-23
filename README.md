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

- **`src/server.js`**: Application entry point, middleware setup, route mounting, and DB connection.
- **`src/config`**: Database and CORS configuration.
- **`src/features/auth`**: Auth routes (login/register/etc).
- **`src/features/products`**: Product routes and logic.
- **`src/features/orders`**: Order management.
- **`src/features/users`**: User management.
- **`src/features/cart`**: Cart operations.
- **`src/shared/middleware`**: Error handling, rate limiting, and other shared middleware.

### Prerequisites

- **Node.js**: v18+ recommended
- **npm**, **pnpm**, or **yarn**
- **MongoDB** instance (local or hosted, e.g. Atlas)

### Installation

```bash
cd src
pnpm install
# or: npm install
```

### Environment Configuration

Create a `.env` file in **`src/`** with the required keys. Example:

```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb
PORT=3010
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

> **Note**: Keep `.env` out of version control and never commit real secrets.

#### MongoDB `querySrv ECONNREFUSED` (Atlas + `mongodb+srv`)

If you see `querySrv ECONNREFUSED` for `_mongodb._tcp.*.mongodb.net`, your network or DNS resolver may block **SRV** lookups.

`src/config/db.js` uses public DNS resolvers before connecting. If it still fails, use Atlas’s **standard** connection string (`mongodb://...`) and set **`MONGO_URI_STANDARD`** in `.env`. Set **`MONGO_SKIP_DNS_FIX=true`** to disable the DNS tweak.

### Running the Server

From the **`src`** directory:

```bash
pnpm dev
# or: npm run dev
```

Production:

```bash
pnpm start
# or: npm start
```

Default URL: `http://localhost:3010` (or `PORT` from `.env`).

Behind a reverse proxy (e.g. Render), `trust proxy` is enabled in `server.js` for correct rate limiting.

### API Overview

- **Auth**: `POST /api/v1/auth/...`
- **Products**: `/api/v1/products`
- **Orders**: `/api/v1/orders`
- **Users**: `/api/v1/users`
- **Cart**: `/api/v1/cart`

### License

**ISC** (see `src/package.json`).
