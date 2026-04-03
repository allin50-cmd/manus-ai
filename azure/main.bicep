// ──────────────────────────────────────────────────────────────
// FineGuard Pro — Azure Infrastructure (Bicep)
// FINE GUARD LTD · Company No. 16895564
// Equivalent to arm-template.json — use whichever your team prefers.
// Deploy: az deployment group create -g fineguard-prod-rg -f azure/main.bicep
// ──────────────────────────────────────────────────────────────

@allowed(['dev', 'staging', 'prod'])
param environment string = 'prod'

param location string = 'uksouth'
param appName string = 'fineguard'
param mysqlAdminLogin string = 'fineguardadmin'

@secure()
param mysqlAdminPassword string

@secure()
param jwtSecret string

@secure()
param stripeSecretKey string

param stripePublishableKey string

@secure()
param stripeWebhookSecret string

param oauthAppId string

@secure()
param companiesHouseApiKey string

@secure()
param perplexityApiKey string

param clicksendUsername string

@secure()
param clicksendApiKey string

// ─── Naming ───────────────────────────────────────
var prefix = '${appName}-${environment}'
var storageAccountName = replace('${appName}${environment}st', '-', '')
var mysqlDatabaseName = 'fineguarddb'
var storageContainerName = 'fineguard-files'

var tags = {
  environment: environment
  project: 'fineguard'
  company: 'FINE GUARD LTD'
}

// ─── Log Analytics ────────────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${prefix}-logs'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// ─── Application Insights ─────────────────────────
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${prefix}-ai'
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

// ─── App Service Plan ─────────────────────────────
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${prefix}-plan'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'B2'
    tier: 'Basic'
    capacity: 1
  }
  properties: {
    reserved: true
  }
}

// ─── MySQL Flexible Server ────────────────────────
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-06-30' = {
  name: '${prefix}-mysql'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B2ms'
    tier: 'Burstable'
  }
  properties: {
    version: '8.0.21'
    administratorLogin: mysqlAdminLogin
    administratorLoginPassword: mysqlAdminPassword
    storage: {
      storageSizeGB: 20
      iops: 360
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-06-30' = {
  parent: mysqlServer
  name: mysqlDatabaseName
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

resource mysqlFirewall 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-06-30' = {
  parent: mysqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ─── Blob Storage ─────────────────────────────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: { name: 'Standard_LRS' }
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource storageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: storageContainerName
  properties: {
    publicAccess: 'None'
  }
}

// ─── Key Vault ────────────────────────────────────
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${prefix}-kv'
  location: location
  tags: tags
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
  }
}

// Key Vault secrets
resource kvJwtSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'jwt-secret'
  properties: { value: jwtSecret }
}

resource kvStripeSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'stripe-secret-key'
  properties: { value: stripeSecretKey }
}

resource kvStripeWebhook 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'stripe-webhook-secret'
  properties: { value: stripeWebhookSecret }
}

resource kvMysqlPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'mysql-admin-password'
  properties: { value: mysqlAdminPassword }
}

resource kvCompaniesHouse 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'companies-house-api-key'
  properties: { value: companiesHouseApiKey }
}

resource kvPerplexity 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'perplexity-api-key'
  properties: { value: perplexityApiKey }
}

resource kvClicksend 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'clicksend-api-key'
  properties: { value: clicksendApiKey }
}

// ─── Web App ──────────────────────────────────────
var databaseUrl = 'mysql://${mysqlAdminLogin}:${mysqlAdminPassword}@${mysqlServer.properties.fullyQualifiedDomainName}:3306/${mysqlDatabaseName}?ssl={"rejectUnauthorized":true}'

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${prefix}-app'
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node server/index.js'
      alwaysOn: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'PORT', value: '8080' }
        { name: 'DATABASE_URL', value: databaseUrl }
        { name: 'JWT_SECRET', value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=jwt-secret)' }
        { name: 'VITE_APP_ID', value: oauthAppId }
        { name: 'OAUTH_SERVER_URL', value: 'https://api.manus.im' }
        { name: 'VITE_OAUTH_PORTAL_URL', value: 'https://manus.im' }
        { name: 'STRIPE_SECRET_KEY', value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=stripe-secret-key)' }
        { name: 'VITE_STRIPE_PUBLISHABLE_KEY', value: stripePublishableKey }
        { name: 'STRIPE_WEBHOOK_SECRET', value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=stripe-webhook-secret)' }
        { name: 'COMPANIES_HOUSE_API_KEY', value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=companies-house-api-key)' }
        { name: 'PERPLEXITY_API_KEY', value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=perplexity-api-key)' }
        { name: 'CLICKSEND_USERNAME', value: clicksendUsername }
        { name: 'CLICKSEND_API_KEY', value: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=clicksend-api-key)' }
        { name: 'AZURE_STORAGE_ACCOUNT_NAME', value: storageAccount.name }
        { name: 'AZURE_STORAGE_CONTAINER_NAME', value: storageContainerName }
        { name: 'AZURE_STORAGE_CONNECTION_STRING', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~22' }
      ]
    }
  }
}

// Key Vault Secrets User role for the Web App managed identity
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, webApp.id, '4633458b-17de-408a-b874-0445c86b69e6')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ─── Outputs ──────────────────────────────────────
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppName string = webApp.name
output mysqlServerFqdn string = mysqlServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output keyVaultName string = keyVault.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
