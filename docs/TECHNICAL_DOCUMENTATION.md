# Technical Documentation - Trinity Part Two

## 1. Architecture
The application follows a **Modular Monolith** architecture with a clear separation of concerns, suitable for a scalable web application.

### Layers
1.  **Presentation Layer (Frontend)**:
    *   **React (Vite)**: Component-based/Single Page Application (SPA).
    *   **Context API**: Manages global state (`AuthContext`, `CartContext`).
    *   **CSS Variables**: Implementation of a global design system/theming.

2.  **API Layer (Backend)**:
    *   **Express.js**: RESTful API endpoints.
    *   **Middlewares**:
        *   `authMiddleware`: JWT validation.
        *   `adminOnly`: Role-based access control (RBAC).
        *   `helmet`: Security headers (CSP, XSS protection).
    *   **Controllers**: Handle request/response logic and input validation.

3.  **Service Layer**:
    *   `supabaseService.js`: Business logic and abstract database interactions.
    *   `openFoodFactsService.js`: External API integration for product data.
    *   **Encapsulation**: Controllers do not query the DB directly; they use `*Ops` objects (e.g., `userOps`, `productOps`).

4.  **Data Persistence**:
    *   **Supabase (PostgreSQL)**: Relational database.
    *   **Schema**:
        *   `users`: Stores auth and profile data.
        *   `products`: Stores inventory, linked to `brands`.
        *   `orders`: Stores transactional data.
        *   `invoices`: Generated snapshots of financial transactions.

## 2. Technological Choices
| Technology | Choice | Justification |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Chosen for performance (Vite HMR), ecosystem (Router, Context), and component reusability. Meets "Any tool you fancy" requirement. |
| **Backend** | **Node.js + Express** | Non-blocking I/O ideal for APIs. Express provides a minimal, unopinonated framework without "magic" (meeting the "No Strapi/API Platform" constraint). |
| **Database** | **PostgreSQL (Supabase)** | Relational data integrity for Orders/Invoices. JSONB support allows flexible storage for `nutritionalInfo` and `gallery`. |
| **Payments** | **PayPal Integration (Planned)** | Backend includes `paymentRoutes` with webhook structures to support future PayPal callbacks (`project (1).pdf` requirement). |

## 3. Data Flows

### Product Creation Flow
1.  **Admin** sends `POST /products` with `barcode`.
2.  **Controller** calls `openFoodFactsService`.
3.  **Service** fetches external data (Name, Brand, Image, Nutrition).
4.  **Controller** merges external data with user input.
5.  **Service** checks/creates `Brand` in DB.
6.  **Service** saves `Product` to DB.
7.  **Response** returns the created product.

### Order & Invoice Flow
1.  **User** sends `POST /orders`.
2.  **Backend** creates `Order` record (Status: Pending).
3.  **Backend** automatically triggers `invoiceOps.create`.
4.  **Backend** decrements `product.quantityInStock`.
5.  **Backend** response with Order details.
6.  (Async) `POST /payments/paypal-webhook` listens for payment confirmation to update Order `paymentStatus`.

## 4. Security Measures
*   **JWT**: Stateless authentication for scalability.
*   **Helmet**: Secures HTTP headers.
*   **Input Validation**: Manual checks in Controllers (e.g., `if (!email) return 400`).
*   **CORS**: Configured to allow communication with Frontend.

## 5. Testing Strategy
*   **Framework**: Jest + Supertest.
*   **Scope**: Unit tests for Critical Paths (`Users`, `Products`).
*   **CI/CD**: `main.yml` runs `npm test` before deployment mirroring.
