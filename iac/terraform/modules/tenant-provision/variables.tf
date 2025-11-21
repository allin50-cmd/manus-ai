variable "resource_group_name" {
  type        = string
  description = "Azure resource group name"
}

variable "storage_account_name" {
  type        = string
  description = "Existing storage account name for tenant containers"
}

variable "key_vault_id" {
  type        = string
  description = "Existing Key Vault resource ID"
}

variable "tenant_slug" {
  type        = string
  description = "Unique tenant identifier (lowercase, hyphenated)"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.tenant_slug))
    error_message = "Tenant slug must contain only lowercase letters, numbers, and hyphens"
  }
}

variable "tenant_name" {
  type        = string
  description = "Human-readable tenant name"
}

variable "tenant_plan" {
  type        = string
  default     = "essentials"
  description = "Tenant subscription plan"

  validation {
    condition     = contains(["essentials", "pro", "enterprise"], var.tenant_plan)
    error_message = "Plan must be one of: essentials, pro, enterprise"
  }
}
