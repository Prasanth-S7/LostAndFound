output "resource_group" { value = azurerm_resource_group.rg.name }
output "container_apps_environment" { value = azurerm_container_app_environment.env.name }
output "auth_app" { value = azurerm_container_app.auth.name }
output "items_app" { value = azurerm_container_app.items.name }
output "gateway_app" { value = azurerm_container_app.gateway.name }

