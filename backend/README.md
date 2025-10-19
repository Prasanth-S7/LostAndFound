## LostNFound Backend (Node.js Microservices)

Simple microservices backend designed for Azure deployment.

Services:
- api-gateway (Express) — proxies auth and items
- auth-service (Express + PostgreSQL) — register, login, verify JWT
- items-service (Express + PostgreSQL) — list and create items

### Quick Start (Docker Compose)

Prereqs: Docker Desktop

1. From `backend/` run:

```bash
docker compose up --build
```

2. Endpoints:
- Gateway: http://localhost:8080/health
- Auth: http://localhost:4001/health
- Items: http://localhost:4002/health

### API Summary

Auth via gateway:
- POST `/auth/register` body: `{ email, password }`
- POST `/auth/login` body: `{ email, password }` → `{ token }`

Items via gateway:
- GET `/items` query: `q`, `status`
- POST `/items` headers: `Authorization: Bearer <token>` body: `{ title, description?, location?, status? }`

Direct service health:
- `/health` on each service

### Local Environment Variables

Default values are set in compose. You can override via environment or a `.env` at the repo root used by compose (not committed).

Common:
- `PGDATABASE` (default: `lostandfound`)
- `PGUSER` (default: `postgres`)
- `PGPASSWORD` (default: `postgres`)
- `PGHOST` (default: `postgres` in compose)
- `PGPORT` (default: `5432`)

Auth:
- `JWT_SECRET` (default: `devsecret`)

Gateway:
- `CORS_ORIGIN` (default: `*`)

### Minimal Schema

Tables are auto-created on startup:
- `users(id serial, email text unique, password_hash text, created_at timestamptz)`
- `items(id serial, title text, description text, location text, status text, user_id int, created_at timestamptz)`

### Azure Deployment (Simple Options)

Option A: Azure Container Apps (recommended for microservices)
1. Build and push images to a registry (e.g., Azure Container Registry):
   - `docker build -t <acr>.azurecr.io/laf-api-gateway:1 ./api-gateway`
   - `docker build -t <acr>.azurecr.io/laf-auth:1 ./auth-service`
   - `docker build -t <acr>.azurecr.io/laf-items:1 ./items-service`
   - `docker push ...`
2. Create a PostgreSQL Flexible Server on Azure. Capture host, db, user, password, port.
3. Create a Container App Environment, then three Container Apps pointing to the images above.
4. Set environment variables per app:
   - auth-service: `PG*` + `JWT_SECRET`
   - items-service: `PG*` + `JWT_SECRET`
   - api-gateway: `AUTH_SERVICE_URL`, `ITEMS_SERVICE_URL`, `CORS_ORIGIN`
5. Expose only the gateway publicly. Keep services internal within the environment.

Option B: Azure App Service (single containers)
1. Build and push images as above.
2. Create three Web App for Containers instances.
3. Configure env vars and networking. Allow gateway to reach services via private endpoints or public URLs.

### Azure Deployment (with Terraform)

Prereqs:
- Azure CLI logged in (az login) and subscription selected
- Terraform >= 1.6
- Docker logged in

1) Build and push images to ACR
- Initialize Terraform and create ACR first (so you get the login server):
```bash
cd backend/infra/terraform
terraform init
terraform apply -auto-approve \
  -var "project=lostandfound" \
  -var "location=southindia" \
  -var "postgres_password=<PG_PASSWORD>" \
  -var "jwt_secret=<JWT_SECRET>" \
  -var "smtp_host=<SMTP_HOST>" -var "smtp_port=587" \
  -var "smtp_user=<SMTP_USER>" -var "smtp_pass=<SMTP_PASS>" \
  -var "sender_email=<SENDER_EMAIL>"
```
- Capture output `acr_login_server`.
- Build and push images from backend/:
```bash
cd ../../
# docker build
docker build -t $ACR/lostandfound-gateway:latest ./api-gateway
docker build -t $ACR/lostandfound-auth:latest ./auth-service
docker build -t $ACR/lostandfound-items:latest ./items-service
# az acr login and push
az acr login --name $(echo $ACR | cut -d. -f1)
docker push $ACR/lostandfound-gateway:latest
docker push $ACR/lostandfound-auth:latest
docker push $ACR/lostandfound-items:latest
```

2) Deploy Container Apps
- Re-apply Terraform to wire the images (names are computed):
  - Images are expected at:
    - `$ACR/lostandfound-gateway:latest`
    - `$ACR/lostandfound-auth:latest`
    - `$ACR/lostandfound-items:latest`
- Run:
```bash
cd infra/terraform
terraform apply -auto-approve \
  -var "project=lostandfound" \
  -var "location=southindia" \
  -var "postgres_password=<PG_PASSWORD>" \
  -var "jwt_secret=<JWT_SECRET>" \
  -var "smtp_host=<SMTP_HOST>" -var "smtp_port=587" \
  -var "smtp_user=<SMTP_USER>" -var "smtp_pass=<SMTP_PASS>" \
  -var "sender_email=<SENDER_EMAIL>"
```
- Output `gateway_fqdn` is your public URL for the API gateway.

Notes:
- Use Azure Postgres Flexible Server SSL settings if your provider enforces SSL; you may need to set PGSSL=true and adjust connection options in the services.
- For production, rotate strong secrets and restrict Container Apps ingress to only the gateway.

### Notes
- Keep `JWT_SECRET` strong in production.
- For production PostgreSQL, enable SSL and set connection string options accordingly.
- Remove exposed service ports when deploying to Azure; expose only the gateway.

### Environment Files (.env)

Use these examples to create `.env` files inside each service folder. In Docker Compose, these values are already provided via environment, but Azure deployments typically set these as app settings.

api-gateway/.env
```env
NODE_ENV=development
PORT=8080
AUTH_SERVICE_URL=http://auth-service:4001
ITEMS_SERVICE_URL=http://items-service:4002
CORS_ORIGIN=*
```

auth-service/.env
```env
NODE_ENV=development
PORT=4001
PGHOST=postgres
PGPORT=5432
PGDATABASE=lostandfound
PGUSER=postgres
PGPASSWORD=postgres
JWT_SECRET=devsecret
```

items-service/.env
```env
NODE_ENV=development
PORT=4002
PGHOST=postgres
PGPORT=5432
PGDATABASE=lostandfound
PGUSER=postgres
PGPASSWORD=postgres
JWT_SECRET=devsecret
# SMTP for Nodemailer
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=no-reply@example.com
```

### Email Delivery

The `items-service` uses Nodemailer with SMTP. Provide SMTP credentials (e.g., SendGrid, Mailgun, Gmail SMTP if permitted) via the variables above. Emails are sent when:
- A lost item is created (confirmation to reporter if email provided)
- An item is marked as found (notification to the original reporter)


