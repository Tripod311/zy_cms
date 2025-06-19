# ZY CMS

CMS engine for Node.js. Name can be interpreted as laZY/eaZY CMS.

Once upon a time I had to make 3 similar services (database + file storage + admin panel + API) in one month. I don't want to do it again, so I created this.

---

## 📚 Table of Contents

* [Installation](#installation)
* [Configuration](#configuration)
* [Database schema](#database-schema)

  * [ZY CMS types](#zy-cms-types)
  * [Relations](#relations)
  * [Basic tables](#basic-tables)
* [First start](#first-start)
* [API overview](#api-overview)

  * [DB](#db)
  * [Auth](#auth)
  * [Storage](#storage)
* [Type reference](#type-reference)

  * [StorageFile](#storagefile)
  * [ReadOptions](#readoptions)
  * [UpdateOptions](#updateoptions)

---

## Installation

Simply run:

```bash
npm install @tripod311/zy_cms
```

---

## Configuration

Here's an example configuration file:

```yaml
admin_panel: true
storage:
  enable: true
  path: "./data/media"
  publicGET: true
db:
  type: "postgres"
  path: "./data/db.sqlite"
  host: "localhost"
  port: 5432
  user: "tripod"
  password: "1234"
  database: "test"
http:
  cookie_secret: "cookie_secret"
  port: 8080
  credentials:
    key: "path-to-key"
    cert: "path-to-cert"
    ca: "path-to-ca"
  cors:
    origin:
      - "http://localhost:8080"
    methods:
      - GET
      - POST
      - PUT
      - DELETE
auth:
  enable: true
  jwt_secret: "jwt_secret"
  secure_cookies: false
localization:
  enable: true
  locales: ["ru", "en"]
  fallbackLocale: "en"
```

Explanation of fields:

* **admin\_panel** – toggle default admin panel
* **storage** – file storage options

  * **enable** – toggle file storage
  * **path** – path to where files will be stored
  * **publicGET** – if true, `/storage/:alias` can be accessed without authorization
* **db** – supports `sqlite`, `mysql`, and `postgres`

  * **path** – only for sqlite
  * other options apply to mysql/postgres
* **http** – webserver settings

  * **cookie\_secret** – optional
  * **port** – port to listen on
  * **credentials** – set to `null` for http mode
  * **cors** – CORS rules
* **auth** – authorization system

  * must be enabled if using admin panel
* **localization** – currently affects only `localized` fields in schema

Put this config into `config.yaml` in the project root.

---

## Database schema

Example `schema.yaml`:

```yaml
tables:
  - name: pages
    fields:
    - name: name
      type: "VARCHAR(300)"
      required: true
      unique: true
    - name: content
      type: "json"
      distinct_type: "TEXT"
      required: true
      localized: true
    - name: content
      type: "markdown"
      distinct_type: "TEXT"
      required: true
      localized: true
    - name: switch
      type: "BOOLEAN"
      required: false
    - name: text
      type: "TEXT"
    - name: date
      type: "datetime"
    - name: author
      type: "VARCHAR(255)"
      relation:
        table: "users"
        column: "login"
        kind: many-to-one
        onDelete: setNull
    - name: some_media
      type: "VARCHAR(255)"
      relation:
        table: "media"
        column: "alias"
        kind: one-to-one
        onDelete: setNull
```

* `tables` is a list of table definitions
* each field has:

  * `name` – column name
  * `type` – SQL or CMS-specific
  * `distinct_type` – enforced SQL type for CMS types
  * `required` – like `NOT NULL`
  * `localized` – creates per-locale columns
  * `relation` – SQL-like foreign key

### ZY CMS types

CMS-specific types:

* `json` – stored as LONGTEXT or equivalent
* `markdown` – stored as LONGTEXT
* `datetime` – stored as ISO string (`VARCHAR(30)`)

> **For PostgreSQL**: you **must** specify `distinct_type`, since PostgreSQL doesn’t have `LONGTEXT`

### Relations

Analogous to SQL `REFERENCES`. Requires:

* `table` and `column`
* `kind`: `one-to-one` or `many-to-one`
* `onDelete`: `cascade`, `setNull`, `restrict`, `noAction`, `setDefault`

> Many-to-many must be modeled manually with intermediate tables

### Basic tables

If auth is enabled, a `users` table is created with:

* `id`, `login`, `password`
* password is stored as bcrypt hash in `CHAR(60)`

If storage is enabled, a `media` table is created with:

* `id`, `alias`, `path`

---

## First start

Create an empty file called `firstLaunch` in your project root.
This allows creating the first user in admin panel.

Example:

```ts
import path from "path";
import Application from "./dist/application.js";
import FastifyStatic from "@fastify/static";

const app = new Application();

async function start () {
  await app.setup();
  await app.start();
}

function stop () {
  (async () => {
    await app.stop();
  })();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

start();
```

Admin panel will be available at `/admin/`.

---

## API overview

### DB

```ts
app.db.create<T>(tableName: string, data: Partial<T>): Promise<void>
app.db.read<T>(tableName: string, options: ReadOptions<T>): Promise<T>
app.db.update<T>(tableName: string, data: Partial<T>, options: UpdateOptions<T>): Promise<void>
app.db.delete<T>(tableName: string, options: DeleteOptions<T>): Promise<void>
```

### Auth

```ts
app.auth.create(login: string, password: string): Promise<void>
app.auth.delete(login: string): Promise<void>
```

Middlewares:

```ts
app.auth.forceAuth(request, reply) // restricts to logged-in users
app.auth.checkAuth(request, reply) // optional login (request.user?.login)
```

Route handler:

```ts
app.auth.authorize(request, reply) // expects JSON { login, password }, sets cookie
```

### Storage

```ts
app.storage.create(file: StorageFile): Promise<void>
app.storage.read(file: StorageFile): Promise<string>
app.storage.update(file: StorageFile): Promise<void>
app.storage.delete(file: StorageFile): Promise<void>
```

---

## Type reference

### StorageFile

```ts
interface StorageFile {
  id?: number;
  alias: string;
  extension?: string;
  path?: string;
  content?: Buffer;
}
```

### ReadOptions

```ts
interface ReadOptions<T> {
  where?: Partial<T> | WhereFilter<T>;
  fields?: (keyof T)[];
  orderBy?: keyof T | `${keyof T & string} ASC` | `${keyof T & string} DESC`;
  limit?: number;
  offset?: number;
}
```

### UpdateOptions

```ts
interface UpdateOptions<T> {
  returning?: boolean;
  where?: Partial<T> | WhereFilter<T>;
}
```

---

> Feel free to open an issue or PR if you’d like to contribute or request a feature ✨
