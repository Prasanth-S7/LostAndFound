terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.116"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "project" {
  type    = string
  default = "lostandfound"
}

variable "location" {
  type    = string
  default = "centralindia"
}

variable "postgres_admin" {
  type    = string
  default = "pgadmin"
}

variable "postgres_password" {
  type = string
  default = "postgres"
}

variable "smtp_host" {
  type    = string
  default = "smtp.gmail.com"
}

variable "smtp_port" {
  type    = number
  default = 587
}

variable "smtp_user" {
  type    = string
  default = "prasanthsampath2005@gmail.com"
}

variable "smtp_pass" {
  type    = string
  default = "dktq thsu srdn wirf"
}

variable "sender_email" {
  type    = string
  default = "prasanthsampath2005@gmail.com"
}

variable "jwt_secret" {
  type = string
  default = "devsecret"
}

locals {
  name = var.project
}

resource "random_id" "suffix" {
  byte_length = 8
}

resource "azurerm_resource_group" "rg" {
  name     = "${local.name}-rg-${random_id.suffix.hex}"
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = replace("${local.name}${random_id.suffix.hex}acr", "-", "")
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = true
}

# Get ACR credentials
data "azurerm_container_registry" "acr" {
  name                = azurerm_container_registry.acr.name
  resource_group_name = azurerm_resource_group.rg.name
  depends_on          = [azurerm_container_registry.acr]
}

resource "azurerm_postgresql_flexible_server" "pg" {
  name                   = "${local.name}-pg-${random_id.suffix.hex}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = var.location
  version                = "16"
  administrator_login    = var.postgres_admin
  administrator_password = var.postgres_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
  zone                   = "1"
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = local.name
  server_id = azurerm_postgresql_flexible_server.pg.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

resource "azurerm_container_app_environment" "env" {
  name                = "${local.name}-env-${random_id.suffix.hex}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
}

resource "azurerm_container_app" "auth" {
  name                         = "${local.name}-auth"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  registry {
    server               = data.azurerm_container_registry.acr.login_server
    username             = data.azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = data.azurerm_container_registry.acr.admin_password
  }

  template {
    container {
      name   = "auth"
      image  = "${data.azurerm_container_registry.acr.login_server}/${local.name}-auth:latest"
      cpu    = 0.5
      memory = "1Gi"
      
      env {
        name  = "PORT"
        value = "4001"
      }
      env {
        name  = "PGHOST"
        value = azurerm_postgresql_flexible_server.pg.fqdn
      }
      env {
        name  = "PGPORT"
        value = "5432"
      }
      env {
        name  = "PGDATABASE"
        value = local.name
      }
      env {
        name  = "PGUSER"
        value = "${var.postgres_admin}@${azurerm_postgresql_flexible_server.pg.name}"
      }
      env {
        name  = "PGPASSWORD"
        value = var.postgres_password
      }
      env {
        name  = "JWT_SECRET"
        value = var.jwt_secret
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 4001
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

resource "azurerm_container_app" "items" {
  name                         = "${local.name}-items"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  registry {
    server               = data.azurerm_container_registry.acr.login_server
    username             = data.azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = data.azurerm_container_registry.acr.admin_password
  }

  template {
    container {
      name   = "items"
      image  = "${data.azurerm_container_registry.acr.login_server}/${local.name}-items:latest"
      cpu    = 0.5
      memory = "1Gi"
      env {
        name  = "PORT"
        value = "4002"
      }
      env {
        name  = "PGHOST"
        value = azurerm_postgresql_flexible_server.pg.fqdn
      }
      env {
        name  = "PGPORT"
        value = "5432"
      }
      env {
        name  = "PGDATABASE"
        value = local.name
      }
      env {
        name  = "PGUSER"
        value = "${var.postgres_admin}@${azurerm_postgresql_flexible_server.pg.name}"
      }
      env {
        name  = "PGPASSWORD"
        value = var.postgres_password
      }
      env {
        name  = "JWT_SECRET"
        value = var.jwt_secret
      }
      env {
        name  = "SMTP_HOST"
        value = var.smtp_host
      }
      env {
        name  = "SMTP_PORT"
        value = tostring(var.smtp_port)
      }
      env {
        name  = "SMTP_USER"
        value = var.smtp_user
      }
      env {
        name  = "SMTP_PASS"
        value = var.smtp_pass
      }
      env {
        name  = "SENDER_EMAIL"
        value = var.sender_email
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 4002
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

resource "azurerm_container_app" "gateway" {
  name                         = "${local.name}-gateway"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  registry {
    server               = data.azurerm_container_registry.acr.login_server
    username             = data.azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = data.azurerm_container_registry.acr.admin_password
  }

  ingress {
    external_enabled = true
    target_port      = 8080
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    container {
      name   = "gateway"
      image  = "${data.azurerm_container_registry.acr.login_server}/${local.name}-gateway:latest"
      cpu    = 0.5
      memory = "1Gi"
      env {
        name  = "PORT"
        value = "8080"
      }
      env {
        name  = "AUTH_SERVICE_URL"
        value = "http://${azurerm_container_app.auth.name}.internal:4001"
      }
      env {
        name  = "ITEMS_SERVICE_URL"
        value = "http://${azurerm_container_app.items.name}.internal:4002"
      }
      env {
        name  = "CORS_ORIGIN"
        value = "*"
      }
    }
  }
}

output "acr_login_server" { 
  value = azurerm_container_registry.acr.login_server 
}

output "postgres_fqdn" { 
  value = azurerm_postgresql_flexible_server.pg.fqdn 
}

output "gateway_fqdn" { 
  value = azurerm_container_app.gateway.latest_revision_fqdn 
}