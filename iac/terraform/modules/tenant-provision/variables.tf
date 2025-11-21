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
  description = "Tenant identifier slug (e.g., stork-nhs)"
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
  description = "Tenant subscription plan"
  default     = "essentials"
  validation {
    condition     = contains(["essentials", "pro", "enterprise"], var.tenant_plan)
    error_message = "Plan must be one of: essentials, pro, enterprise"
  }
}

variable "container_access_type" {
  type        = string
  description = "Container access level"
  default     = "private"
}

variable "tags" {
  type        = map(string)
  description = "Additional tags for resources"
  default     = {}
}
