output "container_name" {
  value       = azurerm_storage_container.tenant_container.name
  description = "Name of the created storage container"
}

output "container_url" {
  value       = "https://${var.storage_account_name}.blob.core.windows.net/${azurerm_storage_container.tenant_container.name}"
  description = "Full URL to the tenant storage container"
}

output "kv_secret_name" {
  value       = azurerm_key_vault_secret.tenant_meta.name
  description = "Name of the Key Vault secret containing tenant metadata"
}

output "kv_secret_id" {
  value       = azurerm_key_vault_secret.tenant_meta.id
  description = "Resource ID of the Key Vault secret"
}

output "tenant_slug" {
  value       = var.tenant_slug
  description = "Tenant identifier slug"
}

output "tenant_plan" {
  value       = var.tenant_plan
  description = "Tenant subscription plan"
}
