# START HERE - 5-Minute Setup

## Copy & Paste These Commands (In Order)

### 1. Download the Code
```bash
git clone https://github.com/allin50-cmd/manus-ai.git
cd manus-ai
```

### 2. Get Latest Updates
```bash
git checkout claude/debug-demo-bundle-01S9Y2ahTrZiRVctVREuCQNx
git pull
```

### 3. Install Dependencies
```bash
npm install
```
*(Wait 1-2 minutes)*

### 4. Start Everything
```bash
./start-local.sh
```

### 5. Test It
```bash
curl -X POST http://localhost:3000/api/jobe/demo-bundle-debug \
  -H "Content-Type: application/json" -d '{}'
```

---

## ✅ Success Looks Like This:

```json
"brandConnectivity": {
  "ultai": { "ok": true, "status": 200 },
  "fineguard": { "ok": true, "status": 200 },
  "vaultline": { "ok": true, "status": 200 }
}
```

All three should say **"ok": true**

---

## 🛑 To Stop Everything:

```bash
./stop-local.sh
```

---

## ⚠️ If Something Goes Wrong:

1. **Kill everything:**
   ```bash
   killall node
   ```

2. **Try starting again:**
   ```bash
   ./start-local.sh
   ```

3. **Still broken?** Read the detailed guide: [QUICK-START.md](./QUICK-START.md)

---

**That's it! You're done!** 🎉
