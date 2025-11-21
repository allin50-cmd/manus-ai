# Tenant Administration UI

React-based dashboard for multi-tenant provisioning and management.

## Features

- ✅ **List all tenants** with sortable columns
- ➕ **Provision new tenants** via intuitive form
- 🔍 **Filter by status and plan**
- 🔄 **Update tenant status** (active, suspended, deactivated)
- 📊 **Expandable details** with storage and audit links
- 📱 **Responsive design** for mobile and desktop
- 🎨 **Modern UI** with gradient accents

## Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on port 3000 (or configure proxy in package.json)

## Installation

```bash
cd admin-tenant-ui
npm install
```

## Development

```bash
npm start
```

Opens at http://localhost:3001 (auto-proxies API requests to localhost:3000)

## Build for Production

```bash
npm run build
```

Output directory: `build/`

Deploy the build directory to:
- Azure Static Web Apps
- Azure App Service
- Any static hosting (Netlify, Vercel, etc.)

## API Endpoints Required

The UI expects these backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | List all tenants |
| GET | `/api/tenants/:slug` | Get tenant details |
| POST | `/api/tenants/provision` | Provision new tenant |
| PUT | `/api/tenants/:slug` | Update tenant |
| DELETE | `/api/tenants/:slug` | Deactivate tenant |
| GET | `/api/ip-vault/blobs/:slug` | List tenant blobs |
| GET | `/api/ip-vault/audit/:slug` | List tenant audit logs |

## Integration with Express Backend

Add to your Express server:

```javascript
const express = require('express');
const path = require('path');
const tenantsRouter = require('./routes/tenants');
const ipVaultRouter = require('./routes/ip-vault');

const app = express();

// API routes
app.use('/api/tenants', tenantsRouter);
app.use('/api/ip-vault', ipVaultRouter);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'admin-tenant-ui/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-tenant-ui/build', 'index.html'));
  });
}

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Configuration

Edit `package.json` proxy for development:

```json
{
  "proxy": "http://your-api-server:port"
}
```

## Environment Variables

For production builds, configure API base URL:

```bash
REACT_APP_API_URL=https://api.yourdomain.com
```

Update API calls in components:

```javascript
const API_URL = process.env.REACT_APP_API_URL || '';
fetch(`${API_URL}/api/tenants`)
```

## Screenshots

### Provisioning Form
Clean form with auto-slug generation and real-time validation.

### Tenant List
Sortable table with status badges, plan indicators, and quick actions.

### Expanded Details
Click any row to view full tenant information, storage links, and audit logs.

## Customization

### Colors

Edit CSS files to match your brand:
- `src/App.css` - Main app colors and gradients
- `src/TenantForm.css` - Form styling
- `src/TenantList.css` - Table and badge colors

### Plans

Add custom plans in `TenantForm.jsx`:

```jsx
<option value="starter">Starter</option>
<option value="custom">Custom</option>
```

### Status Values

Add custom statuses in `TenantList.jsx`:

```javascript
function getStatusColor(status) {
  switch (status) {
    case 'active': return '#10b981';
    case 'trial': return '#06b6d4';
    // Add more...
  }
}
```

## Deployment Examples

### Azure Static Web App

```bash
npm run build
az staticwebapp create \
  --name tenant-admin-ui \
  --resource-group ultai-rg-prod \
  --source ./build \
  --location eastus2
```

### Azure App Service

```bash
npm run build
az webapp up \
  --name tenant-admin-ui \
  --resource-group ultai-rg-prod \
  --plan ultai-app-plan \
  --location eastus2
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
EXPOSE 3000
```

## Troubleshooting

### Proxy errors during development

**Issue:** API requests fail with ECONNREFUSED

**Fix:** Ensure backend server is running on port 3000, or update proxy in package.json

### Build fails with memory error

**Fix:**
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### API calls return 404 in production

**Fix:** Ensure Express serves both API routes AND static files:
```javascript
app.use('/api', apiRouter); // Must come before static middleware
app.use(express.static('build'));
```

## License

MIT
