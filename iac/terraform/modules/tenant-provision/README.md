# Tenant Provisioning Terraform Module

This module provisions Azure infrastructure for a new tenant:
- **Storage Container**: Private blob storage for tenant data
- **Key Vault Secret**: Encrypted metadata storage
- **Lifecycle Policy**: Automatic cost optimization (cool/archive tiers)

## Usage

```hcl
module "tenant_stork" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultai-rg-prod"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/xxx/resourceGroups/ultai-rg-prod/providers/Microsoft.KeyVault/vaults/ultai-rg-prod-kv"

  tenant_slug = "stork-nhs"
  tenant_name = "Stork Maturity (NHS)"
  tenant_plan = "pro"
}

output "stork_container_url" {
  value = module.tenant_stork.container_url
}
```

## Prerequisites

1. Existing Azure Storage Account
2. Existing Azure Key Vault
3. Terraform principal with permissions:
   - `Storage Blob Data Contributor` on storage account
   - `Key Vault Secrets Officer` on Key Vault

## Post-Provisioning

After running `terraform apply`, complete database provisioning:

```bash
node scripts/provision-tenant-msi.js \
  --server ultai-sql-prod.database.windows.net \
  --database ultai_db \
  --tenantSlug stork-nhs \
  --tenantName "Stork Maturity (NHS)" \
  --storageAcct ultaivaultstore \
  --keyVaultName ultai-rg-prod-kv
```

## Variables

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `resource_group_name` | string | Yes | - | Azure resource group |
| `storage_account_name` | string | Yes | - | Storage account name |
| `key_vault_id` | string | Yes | - | Key Vault resource ID |
| `tenant_slug` | string | Yes | - | Tenant identifier (lowercase, hyphenated) |
| `tenant_name` | string | Yes | - | Human-readable name |
| `tenant_plan` | string | No | `essentials` | Plan: essentials, pro, enterprise |

## Outputs

| Name | Description |
|------|-------------|
| `container_name` | Storage container name |
| `container_url` | Full container URL |
| `kv_secret_name` | Key Vault secret name |
| `kv_secret_id` | Key Vault secret resource ID |
