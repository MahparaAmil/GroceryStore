# 🛒 GroceryStore - Premium E-Commerce Experience

[![Rails 7](https://img.shields.io/badge/Rails-7.2-red?style=for-the-badge&logo=ruby-on-rails)](https://rubyonrails.org/)
[![React 18](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

A state-of-the-art Grocery Management and Shopping application built with a **Ruby on Rails** backend and a high-performance **React + Vite** frontend. Featuring a stunning **Emerald Dark Theme**, real-time product data synchronization, and an advanced administrative dashboard.

---

## ✨ Core Features

### 🍏 Real-time Product Intelligence
- **Open Food Facts Integration**: Synchronizes thousands of real-world products with detailed nutritional information.
- **Nutrition Charts**: Every product displays a comprehensive breakdown of Energy, Proteins, Carbs, Sugars, and Fats.
- **Barcode Support**: Full support for product barcodes and categorization.

### 🎨 Stunning Visual Design
- **Emerald Dark Theme**: A custom-designed, premium night-mode interface using `#10b981` accents.
- **Responsive Animations**: Glassmorphism effects, smooth transitions, and micro-interactions for an immersive experience.
- **Rich Media**: High-quality category visuals and verified brand logos (via Wikimedia & UI-Avatars).

### 🛠️ Advanced Administration
- **Power User Dashboard**: Built with a customized **ActiveAdmin** interface, completely overhauled to match the Emerald Dark theme.
- **Inventory Management**: Real-time stock tracking, order processing, and product catalog management.
- **Brand Management**: Centralized hub for managing global brands and their visual identities.

---

## 🏗️ Project Structure

The codebase is organized into a hybrid architecture for maximum scalability:

```text
GroceryStore/
├── app/Controllers/Api/V1/    # RESTful API Endpoints
├── app/Models/                # Business Logic & Relationships
├── app/admin/                 # ActiveAdmin Configuration (Custom UI)
├── config/                    # Rails Application Settings
├── db/                        # Database Migrations & Schema
├── frontend/                  # React + Vite Application
│   ├── src/components/        # Reusable UI Components
│   ├── src/hooks/             # Custom Logic (useProducts, useBrands)
│   ├── src/pages/             # Main application views
│   └── src/services/api.js    # Axios Client & Helper logic
├── lib/tasks/                 # Custom Rake Tasks (sync_products)
└── public/categories/         # Static Assets & Category Images
```

---

## 🚀 Getting Started

### Prerequisites
- **Ruby 3.1+**
- **Node.js 18+**
- **PostgreSQL**

### Installation

1. **Clone & Setup Backend**
   ```bash
   bundle install
   rails db:create db:migrate
   ```

2. **Sync Real World Data**
   ```bash
   rake db:sync_products
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Run Application**
   - Rails (API + Admin): `rails s -p 5001`
   - React (User App): `npm run dev` (Runs on `http://localhost:3000`)

---

## 🛠️ Tech Stack

- **Backend**: Ruby on Rails 7.2.3 (API Mode)
- **Frontend**: React 18, Vite, React Router 6, Axios
- **Admin**: ActiveAdmin 3.4
- **Database**: PostgreSQL (JSONB for nutrition facts)
- **Styling**: Vanilla CSS (Custom Variable System), SCSS for Admin

---

Developed with ❤️ for the ultimate grocery shopping experience.
