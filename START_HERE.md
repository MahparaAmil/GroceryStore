# 🚀 FRESH GROCERY STORE - START HERE

## ⚡ Quick Start (2 Minutes)

### Step 1: Start Backend
```bash
cd /home/mahpara/Documents/GroceryStore/backend
npm run dev
```
✅ Backend runs on: http://localhost:5000

### Step 2: Start Frontend
```bash
cd /home/mahpara/Documents/GroceryStore/frontend
python -m http.server 8000
```
✅ Frontend runs on: http://localhost:8000

### Step 3: Open in Browser
👉 **http://localhost:8000**

---

## �� What Can You Do?

### As a Customer
1. **Browse Products** - See all items with prices
2. **Add to Cart** - Click "Add to Cart" button
3. **View Cart** - Click "Cart (X)" in navbar
4. **Checkout** - 3 options:
   - Guest (no account needed)
   - Login (existing account)
   - Signup (create account)
5. **See Confirmation** - View order details

### As Admin
1. **Login** - Click "Admin" button
2. **See Dashboard** - 4 stat cards
3. **View Tables**:
   - Orders
   - Invoices
   - Users (registered + guest)
   - Products
4. **Logout** - Secure exit

---

## 📚 Documentation

| File | Time | Purpose |
|------|------|---------|
| [FRONTEND_QUICK_START.md](FRONTEND_QUICK_START.md) | 5 min | Get running |
| [FRONTEND_README.md](FRONTEND_README.md) | 10 min | Overview |
| [FRONTEND_SETUP.md](FRONTEND_SETUP.md) | 15 min | Detailed setup |
| [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) | 20 min | Code walkthrough |
| [FRONTEND_COMPLETE.md](FRONTEND_COMPLETE.md) | 10 min | Summary |
| [frontend/README.md](frontend/README.md) | 10 min | API reference |

**👉 New? Start with [FRONTEND_QUICK_START.md](FRONTEND_QUICK_START.md)**

---

## ✨ What Was Built

### Frontend Features
✅ Products page (browse)
✅ Shopping cart (add/remove/adjust)
✅ Checkout (3 options: Login/Guest/Signup)
✅ Order confirmation
✅ Admin login
✅ Admin dashboard (stats + 4 tables)
✅ Responsive design (mobile + desktop)
✅ Error handling (friendly messages)

### Technology
✅ Pure HTML/CSS/JavaScript
✅ No external libraries
✅ No build step needed
✅ ~1,500 lines of code total
✅ Single CSS file (easy to maintain)

---

## 🔧 Admin Test Account

Create admin user (in backend folder):
```bash
node src/utils/createAdmin.js
```

Or login with your existing admin account

---

## 🎨 Design

- **Color**: White background + Soft Green (#2d9d4e)
- **Style**: Simple, minimal, no animations
- **Layout**: Responsive grid system
- **Accessible**: Semantic HTML, proper labels

---

## 📊 File Structure

```
frontend/
├── index.html                 ← Home page
├── css/style.css             ← All styling
├── js/
│   ├── api.js               ← API calls
│   ├── products.js          ← Products logic
│   ├── cart.js              ← Cart logic
│   ├── checkout.js          ← Checkout
│   ├── admin-login.js       ← Admin login
│   └── admin-dashboard.js   ← Admin dashboard
└── pages/
    ├── cart.html
    ├── checkout.html
    ├── order-confirmation.html
    ├── admin-login.html
    └── admin-dashboard.html
```

---

## 🚨 Troubleshooting

### Products don't show?
- ✅ Check backend is running (`npm run dev`)
- ✅ Check backend URL: http://localhost:5000
- ✅ Open DevTools Console (F12) - check for errors

### Admin login fails?
- ✅ Check user role is "admin" in database
- ✅ Check user exists in database
- ✅ Check backend is running

### Nothing loads?
- ✅ Backend running on 5000? `npm run dev`
- ✅ Frontend running on 8000? `python -m http.server 8000`
- ✅ Browser? Open http://localhost:8000
- ✅ Port conflict? Change to different port

**More help?** See [FRONTEND_SETUP.md](FRONTEND_SETUP.md#troubleshooting)

---

## 🎓 Project Info

- **Type**: University project frontend
- **Language**: JavaScript (vanilla)
- **Code Size**: ~1,500 lines
- **Setup Time**: < 5 minutes
- **Ready to**: Demo, Deploy, Extend

---

## ✅ Quick Checklist

Before demoing:
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`python -m http.server 8000`)
- [ ] Open http://localhost:8000
- [ ] Browse products
- [ ] Add item to cart
- [ ] Test guest checkout
- [ ] Test admin login
- [ ] View admin dashboard

---

## 📱 Responsive?

Yes! Works on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (<768px)

---

## 🎬 Demo Flow

**3-minute demo:**
1. Show products page (scroll, view items)
2. Add item to cart
3. Do guest checkout (show order confirmation)
4. Login as admin
5. Show dashboard stats
6. Show orders table
7. Logout

**All working, no extra clicks!**

---

## 💾 Stored Data

Uses browser's localStorage:
```javascript
localStorage['token']    // JWT token
localStorage['user']     // User object
localStorage['cart']     // Cart items
```

Clear all: Open console (F12) and type:
```javascript
localStorage.clear()
```

---

## 🔗 Links

- Backend: http://localhost:5000
- Frontend: http://localhost:8000
- Backend API Docs: http://localhost:5000/api-docs

---

## 🎉 Next Steps

1. **Start backend** → `npm run dev` (backend folder)
2. **Start frontend** → `python -m http.server 8000` (frontend folder)
3. **Open browser** → http://localhost:8000
4. **Try it out** → Add to cart, checkout, login as admin
5. **Explore docs** → See links above

---

## 🆘 Need Help?

1. **Quick questions?** → [FRONTEND_QUICK_START.md](FRONTEND_QUICK_START.md)
2. **Setup problems?** → [FRONTEND_SETUP.md](FRONTEND_SETUP.md)
3. **Code questions?** → [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md)
4. **Overview?** → [FRONTEND_README.md](FRONTEND_README.md)
5. **API reference?** → [frontend/README.md](frontend/README.md)

---

## 🚀 Go!

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && python -m http.server 8000

# Browser
http://localhost:8000
```

**That's it! Enjoy! 🎉**

---

*Built with ❤️ for a clean, simple university project*
*Last updated: December 30, 2025*
