# Azure Static Web App for Frontend
resource "azurerm_static_site" "frontend" {
  name                = "${local.name}-frontend-${random_id.suffix.hex}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = "Central US"  # Static Web Apps has limited regions
  
  app_settings = {
    "VITE_API_BASE" = "https://${azurerm_container_app.gateway.latest_revision_fqdn}"
  }
}

# Output the frontend URL
output "frontend_url" {
  value = "https://${azurerm_static_site.frontend.default_host_name}"
}