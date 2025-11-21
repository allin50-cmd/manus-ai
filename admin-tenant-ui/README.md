# UltraCore Tenant Administration UI

React-based administration interface for managing UltraCore tenant provisioning and configuration.

## Features

- 📋 **Tenant Listing** - View all tenants with status and plan information
- 🚀 **Quick Provisioning** - Simple form-based tenant creation
- 🔍 **Filtering** - Filter tenants by status (active, inactive, provisioning)
- 💼 **Plan Management** - Support for Essentials, Pro, and Enterprise tiers
- 🎨 **Modern UI** - Clean, responsive design

## Quick Start

### Development

```bash
cd admin-tenant-ui
npm install
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000) and proxy API requests to `http://localhost:4000`.

### Production Build

```bash
npm run build
```

Build output will be in the `build/` directory. Serve these static files from your web server.

## Configuration

### API Proxy

The app proxies API requests to the backend. Configure in `package.json`:

```json
{
  "proxy": "http://localhost:4000"
}
```

For production, configure your web server to proxy `/api/*` requests to the backend.

### Environment Variables

Create `.env` file for custom configuration:

```env
REACT_APP_API_URL=https://api.ultracore.io
REACT_APP_ENVIRONMENT=production
```

## Project Structure

```
admin-tenant-ui/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── TenantForm.jsx       # Tenant provisioning form
│   ├── TenantList.jsx       # Tenant list table
│   └── index.js             # Entry point
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Components

### App

Main application component that:
- Fetches tenant data from API
- Manages state (tenants, loading, errors)
- Handles tenant provisioning and deletion
- Provides filtering functionality

### TenantForm

Form component for provisioning new tenants:
- Input validation (slug format, required fields)
- Plan selection (essentials, pro, enterprise)
- Success/error messaging
- Auto-clears form on success

### TenantList

Table component displaying tenants:
- Status badges (active, inactive, provisioning)
- Plan badges with color coding
- Formatted dates
- Action buttons (view, delete)

## API Integration

The UI interacts with these API endpoints:

### Get Tenants
```
GET /api/tenants?status=active&limit=100
```

### Get Tenant
```
GET /api/tenants/:slug
```

### Provision Tenant
```
POST /api/tenants/provision
{
  "slug": "tenant-slug",
  "name": "Tenant Name",
  "email": "contact@example.com",
  "plan": "pro"
}
```

### Delete Tenant
```
DELETE /api/tenants/:slug
```

## Tenant Plans

| Plan | Features | Use Case |
|------|----------|----------|
| **Essentials** | Basic features, limited storage | Small teams, testing |
| **Pro** | Advanced features, increased limits | Growing businesses |
| **Enterprise** | Full features, custom limits | Large organizations |

## Styling

The UI uses CSS Grid and Flexbox for layout. Color scheme:

- **Primary**: `#667eea` → `#764ba2` (gradient)
- **Success**: `#d4edda` / `#155724`
- **Error**: `#f8d7da` / `#721c24`
- **Warning**: `#fff3cd` / `#856404`

## Deployment

### Option 1: Static Hosting

```bash
npm run build
# Upload build/ directory to:
# - Azure Static Web Apps
# - AWS S3 + CloudFront
# - Netlify
# - Vercel
```

### Option 2: Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Azure App Service

```bash
az webapp up \
  --name ultracore-admin \
  --resource-group ultracore-rg \
  --runtime "NODE|18-lts"
```

## Development Tips

### Hot Reload

Changes to components automatically reload:
```bash
npm start
```

### Debugging

Open React DevTools in browser:
- Chrome: React Developer Tools extension
- Firefox: React Developer Tools extension

### API Mocking

For offline development, mock API responses in `App.jsx`:

```javascript
async function fetchTenants() {
  // Mock data
  setTenants([
    {
      id: 1,
      tenant_code: 'demo',
      tenant_name: 'Demo Tenant',
      status: 'active',
      metadata: { plan: 'pro', email: 'demo@example.com' },
      created_at: new Date().toISOString(),
    },
  ]);
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

### API Not Responding

Check backend is running:
```bash
curl http://localhost:4000/health
```

### CORS Errors

Configure CORS in backend:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Future Enhancements

- [ ] Tenant details view
- [ ] Inline editing
- [ ] Bulk operations
- [ ] Export to CSV
- [ ] Advanced filtering
- [ ] User management per tenant
- [ ] Activity logs
- [ ] Analytics dashboard

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Support

For issues or questions, see the main [UltraCore documentation](../README.md).
