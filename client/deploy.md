# Frontend Deployment Guide

## Option 1: Azure Static Web Apps (Recommended)

### Prerequisites
- GitHub repository with your code
- Azure CLI installed

### Steps

1. **Create Static Web App in Azure Portal:**
   ```bash
   az staticwebapp create \
     --name lostandfound-frontend \
     --resource-group your-resource-group \
     --source https://github.com/yourusername/lostandfound \
     --location "Central US" \
     --branch main \
     --app-location "/client" \
     --output-location "dist"
   ```

2. **Get the deployment token:**
   ```bash
   az staticwebapp secrets list --name lostandfound-frontend --resource-group your-resource-group
   ```

3. **Add the token to GitHub Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add secret: `AZURE_STATIC_WEB_APPS_API_TOKEN` with the token from step 2

4. **Update environment variables:**
   - In Azure Portal, go to your Static Web App
   - Navigate to Configuration → Application settings
   - Add: `VITE_API_BASE` = `https://your-gateway-url.azurecontainerapps.io`

5. **Push to main branch to trigger deployment**

## Option 2: Azure App Service (via Terraform)

### Steps

1. **Build and push frontend image:**
   ```bash
   cd client
   docker build -t your-acr.azurecr.io/lostandfound-frontend:latest .
   docker push your-acr.azurecr.io/lostandfound-frontend:latest
   ```

2. **Update Terraform to include frontend:**
   - The `frontend.tf` file is already created
   - Run: `terraform apply` to deploy

3. **Update API base URL:**
   - In Azure Portal, go to your App Service
   - Navigate to Configuration → Application settings
   - Update `VITE_API_BASE` with your gateway URL

## Option 3: Manual Deployment to App Service

### Steps

1. **Build the app:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy using Azure CLI:**
   ```bash
   az webapp deployment source config-zip \
     --resource-group your-resource-group \
     --name your-app-service-name \
     --src dist.zip
   ```

3. **Or use VS Code Azure App Service extension:**
   - Install "Azure App Service" extension
   - Right-click on dist folder → "Deploy to Web App"

## Environment Variables

Make sure to set these in your deployment:

- `VITE_API_BASE`: Your backend gateway URL (e.g., `https://lostandfound-gateway-xxx.azurecontainerapps.io`)

## Notes

- Static Web Apps is free for small projects
- App Service provides more control but costs more
- Both options support custom domains
- Remember to update CORS settings in your backend if needed
