# Quick Start Guide - Brand Services Setup

## What This Does
This guide helps you run the UltraCore system with three brand services (UltAI, FineGuard, and VaultLine) that can check if everything is connected and working properly.

---

## Step 1: Get the Code on Your Computer

### Option A: If you already have the code
1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Type this and press Enter:
   ```bash
   cd manus-ai
   ```
3. If it says "no such file or directory", use **Option B** instead

### Option B: If you need to download the code
1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Copy and paste this command, then press Enter:
   ```bash
   git clone https://github.com/allin50-cmd/manus-ai.git
   ```
3. Wait for it to finish downloading
4. Type this and press Enter:
   ```bash
   cd manus-ai
   ```

---

## Step 2: Get the Latest Updates

1. Copy and paste this command, then press Enter:
   ```bash
   git checkout claude/debug-demo-bundle-01S9Y2ahTrZiRVctVREuCQNx
   ```
2. Then copy and paste this command:
   ```bash
   git pull
   ```

---

## Step 3: Install Required Software

1. Copy and paste this command, then press Enter:
   ```bash
   npm install
   ```
2. Wait for it to finish (this might take 1-2 minutes)
3. You'll see a message like "added 124 packages" when it's done

---

## Step 4: Start Everything

### Easy Way (Recommended)
Copy and paste this command, then press Enter:
```bash
./start-local.sh
```

### Manual Way (If the easy way doesn't work)
Copy and paste these commands one at a time:

1. Start the brand services:
   ```bash
   npm run start:brands &
   ```

2. Start the Jobe AI service:
   ```bash
   npm run start:jobe &
   ```

3. Wait 5 seconds, then continue to Step 5

---

## Step 5: Check If Everything is Working

Copy and paste this command:
```bash
curl -X POST http://localhost:3000/api/jobe/demo-bundle-debug -H "Content-Type: application/json" -d '{}'
```

### What You Should See
You should see a response that includes something like this:
```
"brandConnectivity": {
  "ultai": { "ok": true, "status": 200 },
  "fineguard": { "ok": true, "status": 200 },
  "vaultline": { "ok": true, "status": 200 }
}
```

✅ **If all three show "ok": true** - Everything is working!

❌ **If you see "ok": false** - Something isn't connected. Try Step 6.

---

## Step 6: Test Individual Services

Check each service one at a time by copying these commands:

1. **Check UltAI:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should respond with: `"service": "UltAI"`

2. **Check FineGuard:**
   ```bash
   curl http://localhost:3002/health
   ```
   Should respond with: `"service": "FineGuard"`

3. **Check VaultLine:**
   ```bash
   curl http://localhost:3003/health
   ```
   Should respond with: `"service": "VaultLine"`

---

## Step 7: Stop Everything When You're Done

Copy and paste this command:
```bash
./stop-local.sh
```

Or if that doesn't work, use this:
```bash
killall node
```

---

## Common Issues & Solutions

### Issue: "command not found: git"
**Solution:** You need to install Git first
- Mac: Open Terminal and type `xcode-select --install`
- Windows: Download from https://git-scm.com/downloads

### Issue: "command not found: npm"
**Solution:** You need to install Node.js first
- Go to https://nodejs.org
- Download the "LTS" version (recommended)
- Install it and restart your Terminal

### Issue: Port already in use
**Solution:** Something else is using the ports. Run this:
```bash
killall node
```
Then try Step 4 again.

### Issue: Services won't start
**Solution:** Make sure you're in the right folder:
```bash
pwd
```
Should show something ending in `/manus-ai`

If not, go back to Step 1.

---

## Visual Confirmation

When everything is running, you should see:
```
✅ UltAI API listening on port 3001
✅ FineGuard API listening on port 3002
✅ VaultLine API listening on port 3003
✅ Jobe AI Agent API Server (Port: 3000)
```

---

## Need Help?

If you're stuck:
1. Take a screenshot of the error message
2. Note which step you were on
3. Share with your technical support team

---

## Summary of URLs

Once running, these services are available:

| Service | URL | What it does |
|---------|-----|--------------|
| **Jobe AI** | http://localhost:3000 | Main AI analysis service |
| **UltAI** | http://localhost:3001 | UltAI brand service |
| **FineGuard** | http://localhost:3002 | FineGuard brand service |
| **VaultLine** | http://localhost:3003 | VaultLine brand service |

---

**Last Updated:** November 21, 2025
**Branch:** claude/debug-demo-bundle-01S9Y2ahTrZiRVctVREuCQNx
