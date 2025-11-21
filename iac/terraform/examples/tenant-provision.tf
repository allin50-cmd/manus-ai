# Example: Provisioning Multiple Tenants with UltraCore Tenant Module

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

# Data sources for existing infrastructure
data "azurerm_resource_group" "main" {
  name = "ultracore-prod-rg"
}

data "azurerm_storage_account" "vault" {
  name                = "ultaivaultstore"
  resource_group_name = data.azurerm_resource_group.main.name
}

data "azurerm_key_vault" "main" {
  name                = "ultracore-prod-kv"
  resource_group_name = data.azurerm_resource_group.main.name
}

# ============================================================================
# EXAMPLE 1: Basic Essentials Tenant
# ============================================================================

module "tenant_stork" {
  source = "../modules/tenant-provision"

  resource_group_name  = data.azurerm_resource_group.main.name
  storage_account_name = data.azurerm_storage_account.vault.name
  key_vault_id         = data.azurerm_key_vault.main.id

  tenant_slug = "stork-nhs"
  tenant_name = "Stork Maternity (NHS Trust)"
  tenant_plan = "essentials"

  tags = {
    Environment = "production"
    Industry    = "healthcare"
    Region      = "uk-south"
    ManagedBy   = "Terraform"
  }
}

# ============================================================================
# EXAMPLE 2: Pro Tier Tenant
# ============================================================================

module "tenant_accuracy" {
  source = "../modules/tenant-provision"

  resource_group_name  = data.azurerm_resource_group.main.name
  storage_account_name = data.azurerm_storage_account.vault.name
  key_vault_id         = data.azurerm_key_vault.main.id

  tenant_slug = "accuracy-corp"
  tenant_name = "Accuracy Corporation"
  tenant_plan = "pro"

  tags = {
    Environment = "production"
    Industry    = "finance"
    Region      = "uk-south"
    CostCenter  = "CC-1001"
    ManagedBy   = "Terraform"
  }
}

# ============================================================================
# EXAMPLE 3: Enterprise Tenant with All Features
# ============================================================================

module "tenant_ultraengage" {
  source = "../modules/tenant-provision"

  resource_group_name  = data.azurerm_resource_group.main.name
  storage_account_name = data.azurerm_storage_account.vault.name
  key_vault_id         = data.azurerm_key_vault.main.id

  tenant_slug          = "ultraengage-plc"
  tenant_name          = "UltraEngage Public Limited Company"
  tenant_plan          = "enterprise"
  container_access_type = "private"

  tags = {
    Environment  = "production"
    Industry     = "technology"
    Region       = "uk-south"
    CostCenter   = "CC-2000"
    Compliance   = "ISO27001,SOC2"
    DataClass    = "confidential"
    ManagedBy    = "Terraform"
  }
}

# ============================================================================
# OUTPUTS
# ============================================================================

output "stork_provisioning" {
  description = "Stork NHS tenant provisioning details"
  value       = module.tenant_stork.provisioning_metadata
}

output "accuracy_provisioning" {
  description = "Accuracy Corp tenant provisioning details"
  value       = module.tenant_accuracy.provisioning_metadata
}

output "ultraengage_provisioning" {
  description = "UltraEngage PLC tenant provisioning details"
  value       = module.tenant_ultraengage.provisioning_metadata
  sensitive   = true # Contains sensitive tenant information
}

# ============================================================================
# EXAMPLE: Tenant-Specific Outputs for Automation
# ============================================================================

output "tenant_containers" {
  description = "Map of tenant slugs to container names"
  value = {
    stork       = module.tenant_stork.container_name
    accuracy    = module.tenant_accuracy.container_name
    ultraengage = module.tenant_ultraengage.container_name
  }
}

output "tenant_kv_secrets" {
  description = "Map of tenant slugs to Key Vault secret names"
  value = {
    stork       = module.tenant_stork.kv_secret_name
    accuracy    = module.tenant_accuracy.kv_secret_name
    ultraengage = module.tenant_ultraengage.kv_secret_name
  }
}

# ============================================================================
# EXAMPLE: Post-Provisioning Command Generation
# ============================================================================

output "post_provision_commands" {
  description = "Commands to run after Terraform provisioning"
  value = {
    stork = {
      db_provision = "node scripts/provision-tenant-msi.js --server ultracore-sql.database.windows.net --database ultracore_db --tenantSlug stork-nhs --tenantName 'Stork Maternity (NHS Trust)' --storageAcct ${data.azurerm_storage_account.vault.name} --keyVaultName ${data.azurerm_key_vault.main.name}"

      domain_provision = "./scripts/provision-tenant-domain.sh stork-nhs stork.ultracore.io ultracore-frontdoor ${data.azurerm_resource_group.main.name}"
    }

    accuracy = {
      db_provision = "node scripts/provision-tenant-msi.js --server ultracore-sql.database.windows.net --database ultracore_db --tenantSlug accuracy-corp --tenantName 'Accuracy Corporation' --storageAcct ${data.azurerm_storage_account.vault.name} --keyVaultName ${data.azurerm_key_vault.main.name}"

      domain_provision = "./scripts/provision-tenant-domain.sh accuracy-corp accuracy.ultracore.io ultracore-frontdoor ${data.azurerm_resource_group.main.name}"
    }
  }
}

# ============================================================================
# EXAMPLE: Dynamic Tenant Provisioning with For_Each
# ============================================================================

locals {
  tenants = {
    demo = {
      slug = "demo-tenant"
      name = "Demo Tenant"
      plan = "essentials"
      tags = { Purpose = "demonstration" }
    }
    test = {
      slug = "test-tenant"
      name = "Test Tenant"
      plan = "pro"
      tags = { Purpose = "testing" }
    }
  }
}

module "dynamic_tenants" {
  source   = "../modules/tenant-provision"
  for_each = local.tenants

  resource_group_name  = data.azurerm_resource_group.main.name
  storage_account_name = data.azurerm_storage_account.vault.name
  key_vault_id         = data.azurerm_key_vault.main.id

  tenant_slug = each.value.slug
  tenant_name = each.value.name
  tenant_plan = each.value.plan

  tags = merge(
    {
      Environment = "production"
      ManagedBy   = "Terraform"
    },
    each.value.tags
  )
}

output "dynamic_tenant_urls" {
  description = "Container URLs for dynamically provisioned tenants"
  value = {
    for key, tenant in module.dynamic_tenants :
    key => tenant.container_url
  }
}
