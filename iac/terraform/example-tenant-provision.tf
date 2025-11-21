# Example: Provision multiple tenants using the tenant-provision module
# Copy this file to your main Terraform directory and customize

# Example 1: NHS Stork tenant with Pro plan
module "tenant_stork_nhs" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultai-rg-prod"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/ultai-rg-prod/providers/Microsoft.KeyVault/vaults/ultai-rg-prod-kv"

  tenant_slug = "stork-nhs"
  tenant_name = "Stork Maturity (NHS)"
  tenant_plan = "pro"
}

# Example 2: Enterprise customer
module "tenant_acme_corp" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultai-rg-prod"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/ultai-rg-prod/providers/Microsoft.KeyVault/vaults/ultai-rg-prod-kv"

  tenant_slug = "acme-corp"
  tenant_name = "ACME Corporation"
  tenant_plan = "enterprise"
}

# Example 3: Essentials tier customer
module "tenant_startup_xyz" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultai-rg-prod"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/ultai-rg-prod/providers/Microsoft.KeyVault/vaults/ultai-rg-prod-kv"

  tenant_slug = "startup-xyz"
  tenant_name = "Startup XYZ"
  tenant_plan = "essentials"
}

# Outputs for easy reference
output "stork_nhs_container" {
  value       = module.tenant_stork_nhs.container_url
  description = "Stork NHS tenant container URL"
}

output "stork_nhs_secret" {
  value       = module.tenant_stork_nhs.kv_secret_name
  description = "Stork NHS tenant metadata secret"
  sensitive   = false
}

output "all_tenant_containers" {
  value = {
    stork_nhs   = module.tenant_stork_nhs.container_url
    acme_corp   = module.tenant_acme_corp.container_url
    startup_xyz = module.tenant_startup_xyz.container_url
  }
  description = "Map of all tenant container URLs"
}
