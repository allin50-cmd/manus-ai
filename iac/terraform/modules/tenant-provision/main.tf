terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Create tenant-specific storage container
resource "azurerm_storage_container" "tenant_container" {
  name                  = "tenant-${var.tenant_slug}"
  storage_account_name  = var.storage_account_name
  container_access_type = "private"
}

# Store tenant metadata in Key Vault
resource "azurerm_key_vault_secret" "tenant_meta" {
  name         = "tenant-${var.tenant_slug}-meta"
  key_vault_id = var.key_vault_id
  value        = jsonencode({
    slug    = var.tenant_slug
    name    = var.tenant_name
    plan    = var.tenant_plan
    created = timestamp()
  })

  content_type = "application/json"

  tags = {
    tenant      = var.tenant_slug
    environment = "production"
    managed_by  = "terraform"
  }
}

# Optional: Set container lifecycle policy for cost optimization
resource "azurerm_storage_management_policy" "tenant_lifecycle" {
  storage_account_id = "/subscriptions/${data.azurerm_subscription.current.subscription_id}/resourceGroups/${var.resource_group_name}/providers/Microsoft.Storage/storageAccounts/${var.storage_account_name}"

  rule {
    name    = "tenant-${var.tenant_slug}-archive"
    enabled = true

    filters {
      prefix_match = ["tenant-${var.tenant_slug}/"]
      blob_types   = ["blockBlob"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = 90
        tier_to_archive_after_days_since_modification_greater_than = 180
      }
    }
  }
}

data "azurerm_subscription" "current" {}
