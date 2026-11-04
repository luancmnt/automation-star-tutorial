# E-commerce Checkout API

REST API for an e-commerce checkout flow. It exposes four business endpoints — **Register**, **Login**, **Cart**, and **Checkout** — built with Express and an in-memory store (data lives in variables and resets when the process stops).

## How to install

Requirements: Node.js 18 or later.

```bash
git clone https://github.com/luancmnt/automation-star-tutorial.git
cd automation-star-tutorial
npm install
```

## How to run

```bash
npm start
```

The server listens on `http://localhost:3000` by default. Set `PORT` to change it:

```bash
PORT=4000 npm start
```

For local development with automatic restarts:

```bash
npm run dev
```

## Test data

The process seeds three products and three users on startup.

### Users

| ID | Name | Email | Password |
| --- | --- | --- | --- |
| `user-1` | Alice Johnson | `alice@example.com` | `alice123` |
| `user-2` | Bob Smith | `bob@example.com` | `bob12345` |
| `user-3` | Carol Davis | `carol@example.com` | `carol123` |

### Products

| ID | Name | Price |
| --- | --- | --- |
| `prod-1` | Wireless Headphones | 150.00 |
| `prod-2` | USB-C Hub | 45.00 |
| `prod-3` | Mechanical Keyboard | 120.00 |

Carts start empty. Login first, then `POST /cart` with product IDs from the table above.

Example checkout flow:

```bash
TOKEN=$(curl -s http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"alice123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -s http://localhost:3000/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":"prod-1","quantity":1},{"productId":"prod-2","quantity":2}]}'

curl -s http://localhost:3000/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"paymentMethod":"cash"}'
```

## Business rules

- **Register** creates a new user. Emails must be unique. Passwords must be at least 6 characters.
- **Login** returns a bearer token. Cart and Checkout require `Authorization: Bearer <token>`.
- **Cart** replaces the authenticated user's cart with the submitted items. Unknown product IDs are rejected.
- **Checkout** charges the current cart:
  - `cash` applies a **10% discount** on the subtotal.
  - `credit_card` applies **no discount**.
- An empty cart cannot be checked out.
- After a successful checkout the cart is cleared.
- All data is in memory. Restarting the server restores the three seed users and products and drops sessions, carts, and orders.

## Important URLs

| URL | Description |
| --- | --- |
| `http://localhost:3000/register` | `POST` register a user |
| `http://localhost:3000/login` | `POST` login and receive a token |
| `http://localhost:3000/cart` | `POST` set the authenticated user's cart |
| `http://localhost:3000/checkout` | `POST` pay for the current cart |
| `http://localhost:3000/docs` | Swagger UI rendered from the OpenAPI YAML |
| `http://localhost:3000/openapi.yaml` | Raw OpenAPI specification |
