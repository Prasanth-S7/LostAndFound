# Build and push all services
cd auth-service
docker build -t "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-auth:latest" .
docker push "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-auth:latest"
cd ..

cd items-service
docker build -t "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-items:latest" .
docker push "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-items:latest"
cd ..

cd api-gateway
docker build -t "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-gateway:latest" .
docker push "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-gateway:latest"
cd ..

# Restart services with correct command
cd infra\terraform
$resourceGroup = terraform output -raw resource_group
az containerapp update --name lostandfound-auth --resource-group $resourceGroup --image "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-auth:latest"
az containerapp update --name lostandfound-items --resource-group $resourceGroup --image "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-items:latest"
az containerapp update --name lostandfound-gateway --resource-group $resourceGroup --image "lostandfound6e7c665094dd0f40acr.azurecr.io/lostandfound-gateway:latest"

Write-Host "✅ Backend deployed successfully!"