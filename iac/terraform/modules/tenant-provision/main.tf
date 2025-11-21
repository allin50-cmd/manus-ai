terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# Tenant-specific storage container for IP vault and documents
resource "azurerm_storage_container" "tenant_container" {
  name                  = "tenant-${var.tenant_slug}"
  storage_account_name  = var.storage_account_name
  container_access_type = var.container_access_type

  metadata = merge(
    {
      tenant_slug = var.tenant_slug
      tenant_name = var.tenant_name
      tenant_plan = var.tenant_plan
      created     = timestamp()
    },
    var.tags
  )
}

# Tenant metadata stored in Key Vault as JSON secret
resource "azurerm_key_vault_secret" "tenant_meta" {
  name         = "tenant-${var.tenant_slug}-meta"
  key_vault_id = var.key_vault_id

  value = jsonencode({
    slug              = var.tenant_slug
    name              = var.tenant_name
    plan              = var.tenant_plan
    container_name    = azurerm_storage_container.tenant_container.name
    created_timestamp = timestamp()
    terraform_managed = true
  })

  content_type = "application/json"

  tags = merge(
    {
      tenant_slug   = var.tenant_slug
      resource_type = "tenant_metadata"
    },
    var.tags
  )
}

# Optional: Create tenant-specific backup container
resource "azurerm_storage_container" "tenant_backup_container" {
  name                  = "tenant-${var.tenant_slug}-backups"
  storage_account_name  = var.storage_account_name
  container_access_type = "private"

  metadata = {
    tenant_slug  = var.tenant_slug
    purpose      = "backups"
    retention    = "90days"
  }
}

# Storage lifecycle management for tenant backups (optional)
resource "azurerm_storage_management_policy" "tenant_backup_lifecycle" {
  count              = var.tenant_plan == "enterprise" ? 1 : 0
  storage_account_id = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${var.resource_group_name}/providers/Microsoft.Storage/storageAccounts/${var.storage_account_name}"

  rule {
    name    = "tenant-${var.tenant_slug}-backup-lifecycle"
    enabled = true

    filters {
      prefix_match = ["${azurerm_storage_container.tenant_backup_container.name}/"]
      blob_types   = ["blockBlob"]
    }

    actions {
      base_blob {
        tier_to_cool_after_days_since_modification_greater_than    = 30
        tier_to_archive_after_days_since_modification_greater_than = 90
        delete_after_days_since_modification_greater_than          = 365
      }

      snapshot {
        delete_after_days_since_creation_greater_than = 90
      }
    }
  }
}

# Get current Azure subscription for constructing resource IDs
data "azurerm_client_config" "current" {}
