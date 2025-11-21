# Tenant Provision Terraform Module

This module provisions Azure infrastructure for a new UltraCore tenant including:
- Tenant-specific storage container for IP vault and documents
- Backup storage container with lifecycle management
- Key Vault secret for tenant metadata
- Optional storage lifecycle policies (enterprise tier)

## Usage

### Basic Example

```hcl
module "tenant_stork" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultracore-prod-rg"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/xxx/resourceGroups/ultracore-prod-rg/providers/Microsoft.KeyVault/vaults/ultracore-kv"

  tenant_slug = "stork-nhs"
  tenant_name = "Stork Maturity (NHS)"
  tenant_plan = "pro"

  tags = {
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
```

### Enterprise Example with Full Configuration

```hcl
module "tenant_accuracy" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultracore-prod-rg"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = data.azurerm_key_vault.main.id

  tenant_slug          = "accuracy-corp"
  tenant_name          = "Accuracy Corporation"
  tenant_plan          = "enterprise"
  container_access_type = "private"

  tags = {
    Environment = "production"
    Tenant      = "accuracy-corp"
    CostCenter  = "CC-1001"
    ManagedBy   = "Terraform"
  }
}

output "accuracy_provisioning" {
  value = module.tenant_accuracy.provisioning_metadata
}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0 |
| azurerm | ~> 3.0 |

## Providers

| Name | Version |
|------|---------|
| azurerm | ~> 3.0 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| resource_group_name | Azure resource group name | `string` | n/a | yes |
| storage_account_name | Existing storage account name | `string` | n/a | yes |
| key_vault_id | Existing Key Vault resource ID | `string` | n/a | yes |
| tenant_slug | Tenant identifier slug | `string` | n/a | yes |
| tenant_name | Human-readable tenant name | `string` | n/a | yes |
| tenant_plan | Tenant subscription plan | `string` | `"essentials"` | no |
| container_access_type | Container access level | `string` | `"private"` | no |
| tags | Additional tags for resources | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| tenant_slug | Tenant identifier slug |
| container_name | Name of the tenant storage container |
| container_url | Full URL to the tenant storage container |
| backup_container_name | Name of the tenant backup container |
| backup_container_url | Full URL to the tenant backup container |
| kv_secret_name | Name of the Key Vault secret |
| kv_secret_id | Full ID of the Key Vault secret |
| kv_secret_version | Version of the Key Vault secret |
| provisioning_metadata | Complete provisioning metadata |

## Resources Created

1. **Storage Container** (`tenant-{slug}`)
   - Private access by default
   - Metadata includes tenant information
   - Used for IP vault and document storage

2. **Backup Container** (`tenant-{slug}-backups`)
   - Always private access
   - 90-day retention metadata
   - Enterprise tier gets lifecycle management

3. **Key Vault Secret** (`tenant-{slug}-meta`)
   - JSON metadata including tenant configuration
   - Version tracked
   - Tagged with tenant information

4. **Lifecycle Policy** (Enterprise only)
   - Cool tier after 30 days
   - Archive tier after 90 days
   - Delete after 365 days
   - Snapshot cleanup after 90 days

## Post-Provisioning Steps

After running Terraform, complete tenant provisioning with:

1. **Database Provisioning**
   ```bash
   node scripts/provision-tenant-msi.js \
     --server ultracore-sql.database.windows.net \
     --database ultracore_db \
     --tenantSlug stork-nhs \
     --tenantName "Stork Maturity (NHS)" \
     --storageAcct ultaivaultstore \
     --keyVaultName ultracore-kv
   ```

2. **Custom Domain Setup** (if applicable)
   ```bash
   ./scripts/provision-tenant-domain.sh \
     stork-nhs \
     stork.yourdomain.com \
     ultracore-frontdoor \
     ultracore-prod-rg
   ```

## Security Considerations

- All containers are private by default
- Key Vault secrets are versioned and tagged
- Lifecycle policies prevent data accumulation
- RBAC should be configured separately for tenant access
- Use managed identities for accessing tenant resources

## Terraform State

Ensure your Terraform state is stored securely:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstate${random_id.sa.hex}"
    container_name       = "tfstate"
    key                  = "tenants/${var.tenant_slug}/terraform.tfstate"
  }
}
```

## Cleanup

To decommission a tenant:

```bash
# Backup data first!
./scripts/db-manager.sh backup

# Then destroy Terraform resources
terraform destroy -target=module.tenant_stork
```

## Support

For issues or questions, see the main [README](../../../README.md).
