# Backend Request & Authentication Lifecycle

This guide walks through how data, authentication tokens, and errors flow through the modular [MVC](#mvc) backend architecture (Exercises 1–11).

---

## Trace: End-to-End Request Lifecycle

### Step 1: Creating a New User (`POST /api/users`)
1. **The Trigger  [Client] (`requestsAuth.rest`):** A `POST` request is sent to `/api/users` with `username` (email), `name`, and `password`.
2. **Entry Point [Application Routing] (`index.js`):** Express routes paths matching `/api/users` to the users controller (`controllers/users.js`).
3. **Controller (controllers/users.js):** Receives the request, extracts the submitted user data and passes it to the `User` model to create a new user record.

4. **Model (models/user.js):** Sequelize applies model-level validations (such as `isEmail`) and handles the database interaction with PostgreSQL.

   * Valid: A new user record is saved to PostgreSQL, and the created user object is returned to the controller.

   * Invalid: Sequelize throws a validation error, which is passed via next(error) to the centralised errorHandler middleware, returning a 400 Bad Request to the client.

5. **Response [Controller/View]:** If creation succeeds, the controller sends a `201 Created` response containing the newly created user object (excluding the password hash).

### Step 2: Logging In & Obtaining a JWT (`POST /api/login`)
1. **The Trigger [Client] (`requestsAuth.rest`):** A `POST` request is sent to `/api/login` with user credentials.
2. **Lookup [Controller] (`controllers/login.js`):** Queries PostgreSQL via `User.findOne({ where: { username } })` to retrieve the user's account.
3. **Database Retrieval [Model] (models/user.js):** The User model handles the database query through Sequelize and retrieves the matching user record from PostgreSQL.
4. **Password Verification [Supporting Library] (`bcrypt`):** Compares the incoming plaintext password against the stored password hash using `bcrypt.compare()`.
5. **Token Signing [Supporting Library] (`jsonwebtoken`):** If valid, signs a payload containing the user's `username` and database `id` with `SECRET`, returning `200 OK` along with the JWT string.
6. **Response: [Controller]** The server returns a `200 OK` along with the signed JWT string (token), which our REST Client automatically captures into our `@authToken` variable. No view component/file used. This is  conceptual view responsibility.

### Step 3: Creating a Protected Blog Post (`POST /api/blogs`)
1. **The Trigger  [Client] (`requestsAuth.rest`):** A `POST` request is sent with blog data and the `Authorization: Bearer <token>` header.
2. **Authentication [Middleware] (`utils/authMiddleware.js`):** `tokenExtractor` intercepts the request, strips the `Bearer ` prefix, verifies the signature with `jwt.verify()`, and attaches the decoded payload to `req.decodedToken`.
3. **User Lookup [Controller] (`controllers/blogs.js`):** The controller retrieves the authenticated user's id from `req.decodedToken.id` and requests the corresponding user record using `User.findByPk()`.
4. **User Retrieval [Model] (`models/user.js`): The User model uses Sequelize to retrieve the matching user record from PostgreSQL.
5. **Blog Creation** [Controller] (`controllers/blogs.js`): The controller prepares the blog data, associates it with the authenticated user using `userId: user.id`, and passes it to the Blog model.
6. **Database Insertion [Model] (`models/blog.js`):** The Blog model handles saving the new blog record to PostgreSQL, including the foreign key relationship to the user.
7. **Response Generation [Controller] (`controllers/blogs.js`):** The controller receives the newly created blog object and constructs a `201 Created` HTTP response.
8.  **Response Presentation [View / JSON]:** The newly created blog object is returned to the client as JSON.

### Step 4: Deleting a Blog Post (`DELETE /api/blogs/:id`)
1. **The Trigger  [Client] (requestsAuth.rest):** We send a DELETE request to `/api/blogs/1` with our `Authorization: Bearer {{authToken}}` header.
2. **Authentication [Middleware] (`utils/authMiddleware.js`):** tokenExtractor verifies the user's JWT and sets `req.decodedToken`, making the authenticated user's id available to subsequent middleware and controllers.
3. **Blog Lookup [Middleware] (`blogFinder`):** blogFinder intercepts the request and calls `Blog.findByPk(req.params.id)` to retrieve the requested blog post. It attaches the result to `req.blog` or returns `404 Not Found` if the blog doesn't exist.
4. **Database Retrieval [Model] (`models/blog.js`):** The Blog model uses Sequelize to retrieve the matching blog record from PostgreSQL.
5. **Ownership Verification [Controller] (`controllers/blogs.js`):** The controller compares `req.blog.userId` with `req.decodedToken.id`. If they do not match, it returns `403 Forbidden`, preventing the user from deleting someone else's blog post.
6. **Deletion Request [Controller] (`controllers/blogs.js`):** If ownership is verified, the controller calls `await req.blog.destroy()` to delete the blog record.
7. **Database Deletion [Model] (`models/blog.js`):** The `Blog` model handles the deletion of the corresponding record from PostgreSQL.
8. **Response Generation [Controller] (`controllers/blogs.js`):** The controller returns a `204 No Content` HTTP status to confirm successful deletion.
9. **Response Presentation [View / HTTP]:** The server sends the `204 No Content` response to the client, with no response body.

---

## Detail: How `tokenExtractor` & `req.decodedToken` Work

### What is `tokenExtractor`?
`tokenExtractor` is the name of the **middleware function**, not the token value itself. Its responsibility is to inspect incoming headers, validate the JWT, and unpack the user data inside it.

```javascript
req.decodedToken = jwt.verify(authorisation.substring(7), SECRET)
```

* `authorisation.substring(7)` extracts the raw token string.
* `jwt.verify()` validates the signature and returns the decoded payload object (e.g., `{ id: 1, username: 'authenticateduser@gmail.com' }`).
* That payload is attached to the shared Express request object as **`req.decodedToken`**.

### Where does `req.decodedToken.id` go?
* **Internal Server Pipeline (Yes):** We can think of the `req` object as a shared container passed from middleware to route handlers. When `tokenExtractor` calls `next()`, the downstream route handler (such as `POST /api/blogs` or `DELETE /api/blogs/:id`) reads `req.decodedToken.id` to identify the authenticated user.
* **User View / Client (No):** `req.decodedToken.id` is never sent back to the client directly; it is used internally on the server to enforce permissions and establish database foreign keys.

---

## Detail: How JWT Creation, Exchange & Validation Work

A **JSON Web Token (JWT)** is a compact, cryptographically signed string made up of three Base64-encoded parts separated by dots: `Header.Payload.Signature`.

### Creation (`POST /api/login` via `jwt.sign`)
When a user logs in with valid credentials, the server constructs a payload object containing non-sensitive identifying claims:

```javascript
const userForToken = {
  username: user.username,
  id: user.id,
}
const token = jwt.sign(userForToken, SECRET)
```

* **Header:** Automatically generated by `jsonwebtoken`, specifying the token type (`JWT`) and signing algorithm (typically `HS256`).
* **Payload:** Contains our `userForToken` data (`username` and `id`). **Crucial security note:** The payload is *encoded* (Base64), not encrypted—anyone who intercepts the token can decode and read the payload, which is why passwords are never included.
* **Signature:** The server combines the encoded Header, the encoded Payload, and our private `SECRET` key (from `.env`), running them through a cryptographic hashing algorithm. This produces a unique signature that acts as a tamper-evident seal.

### Exchange (Client $\leftrightarrow$ Server)
* **Issuing:** The server sends the token back to the client in the JSON login response (`{ token: "eyJhbG..." }`).
* **Storage & Attachment:** The client (e.g., `requestsAuth.rest` via `@authToken` or browser `localStorage`) stores the token and sends it back on subsequent protected requests inside the HTTP header:
  ```http
  Authorization: Bearer <token>
  ```
* **Statelessness:** Because the token carries the user's `id` and `username` inside its payload, the server does not need to store active sessions in memory or query a sessions table on every request.

### Validation (`tokenExtractor` via `jwt.verify`)
When a protected route receives a request, `jwt.verify(token, SECRET)` performs a mathematical integrity check:
1. It splits the incoming token into its Header, Payload, and Signature.
2. It takes the incoming Header and Payload and re-runs the hashing algorithm using the server's local `SECRET`.
3. It compares this newly computed signature against the Signature attached to the incoming token:
   * **Match:** The token is authentic and unaltered. `jwt.verify()` decodes the payload and attaches it to `req.decodedToken`.
   * **Mismatch or Expired:** If even a single character in the payload was altered by an attacker (e.g., changing `id: 2` to `id: 1`) or if the wrong `SECRET` was used, the signatures will not match. `jwt.verify()` throws a `JsonWebTokenError`, which our `catch` block intercepts to return `401 Unauthorized`.

---

## Detail: How Password Hashing & `saltRounds = 10` Work (`bcrypt`)

Plaintext passwords should never be stored in a database. Instead, `bcrypt` converts passwords into irreversible cryptographic hashes before saving them to PostgreSQL.

```javascript
const saltRounds = 10
const passwordHash = await bcrypt.hash(password, saltRounds)
```

### What is a "Salt"?
If two users choose the same password (`"secret"`), a basic hash function would produce the exact same hash for both, leaving them vulnerable to precomputed lookup tables (**Rainbow Table attacks**).
* Before hashing, `bcrypt` generates a **salt**—a random string of characters unique to that specific user.
* It combines the password + random salt before hashing, ensuring that two identical passwords produce completely different hashes in the database.
* `bcrypt` automatically embeds the salt directly inside the final resulting hash string so it doesn't need to be stored in a separate database column.

### What does `saltRounds = 10` (The Cost Factor) mean?
`saltRounds` is not the number of times a salt is added; it is the **computational cost factor** expressed as a power of 2 ($2^{\text{rounds}}$).
* With `saltRounds = 10`, `bcrypt` executes **$2^{10} = 1,024$ iterations** of its key-derivation algorithm (Eksblowfish) to produce the final hash.
* **Why intentionally slow?** Standard cryptographic hashes (like SHA-256) are designed to be fast, allowing modern GPUs to guess billions of passwords per second in a brute-force attack. `bcrypt` is intentionally slow. At 10 rounds, hashing takes roughly ~60–100 milliseconds—imperceptible to a human logging in once, but cripplingly slow for an attacker trying to guess millions of password combinations.

### How Verification Works Without Decrypting (`bcrypt.compare`)
Because hashing is a **one-way function**, the server can never decrypt `user.passwordHash` back into `"secret"`. Instead, during `POST /api/login`:

```javascript
const passwordCorrect = await bcrypt.compare(password, user.passwordHash)
```

1. `bcrypt.compare()` reads the original salt and cost factor (`10`) embedded at the beginning of `user.passwordHash`.
2. It runs the incoming plaintext `password` through the exact same $2^{10}$ hashing process using that extracted salt.
3. If the newly generated hash matches `user.passwordHash`, the password is verified (`true`).

---

## Detail: Centralised Error Handling (`errorHandler`)

### Importing vs. Mounting (`index.js`)
* **Importing (`require`):** Loads the function into a variable in `index.js`:
  ```javascript
  const { errorHandler } = require('./utils/errorMiddleware')
  ```
* **Mounting (`app.use`):** Plugs the middleware into the very end of the Express pipeline so it catches errors passed via `next(error)`:
  ```javascript
  app.use(errorHandler)
  ```

### Where do error responses go?
When a controller catches an error and calls `next(error)`, Express skips all remaining route handlers and jumps straight to `errorHandler`. Calling `return res.status(400).json({ error: messages })` terminates the HTTP request-response cycle and sends the JSON payload **directly back to the client (user view)** without returning to the controller or `index.js`.


## NOTES:

### <a id="mvc"></a>Model–View–Controller

The Model–View–Controller (MVC) architectural pattern divides a web application into three core logical components to achieve a clean separation of concerns:

• Model: Manages the application's data, business logic, state rules, and database interactions (such as querying relational or non-relational stores).

• View: Handles the user interface (UI) and presentation layer, rendering HTML/CSS/JavaScript or templating markup (like Razor in ASP.NET or Blade in Laravel) so the user can see the data.

• Controller: Acts as the intermediary logic processor that receives incoming HTTP requests, processes user input, interacts with the Model to fetch or modify data, and selects the appropriate View to return.