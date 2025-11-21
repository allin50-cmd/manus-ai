output "tenant_slug" {
  description = "Tenant identifier slug"
  value       = var.tenant_slug
}

output "container_name" {
  description = "Name of the created tenant storage container"
  value       = azurerm_storage_container.tenant_container.name
}

output "container_url" {
  description = "Full URL to the tenant storage container"
  value       = "https://${var.storage_account_name}.blob.core.windows.net/${azurerm_storage_container.tenant_container.name}"
}

output "backup_container_name" {
  description = "Name of the tenant backup container"
  value       = azurerm_storage_container.tenant_backup_container.name
}

output "backup_container_url" {
  description = "Full URL to the tenant backup container"
  value       = "https://${var.storage_account_name}.blob.core.windows.net/${azurerm_storage_container.tenant_backup_container.name}"
}

output "kv_secret_name" {
  description = "Name of the Key Vault secret containing tenant metadata"
  value       = azurerm_key_vault_secret.tenant_meta.name
}

output "kv_secret_id" {
  description = "Full ID of the Key Vault secret"
  value       = azurerm_key_vault_secret.tenant_meta.id
}

output "kv_secret_version" {
  description = "Version of the Key Vault secret"
  value       = azurerm_key_vault_secret.tenant_meta.version
}

output "provisioning_metadata" {
  description = "Complete provisioning metadata for the tenant"
  value = {
    tenant_slug          = var.tenant_slug
    tenant_name          = var.tenant_name
    tenant_plan          = var.tenant_plan
    container_name       = azurerm_storage_container.tenant_container.name
    backup_container     = azurerm_storage_container.tenant_backup_container.name
    kv_secret_name       = azurerm_key_vault_secret.tenant_meta.name
    storage_account      = var.storage_account_name
    resource_group       = var.resource_group_name
  }
}
