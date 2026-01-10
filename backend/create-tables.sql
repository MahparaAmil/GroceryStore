-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    isGuest BOOLEAN DEFAULT FALSE,
    ordersCount INTEGER DEFAULT 0,
    lastOrderAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    picture VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    quantityInStock INTEGER DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderNumber VARCHAR(50) UNIQUE NOT NULL,
    userId UUID REFERENCES public.users(id) ON DELETE SET NULL,
    guestInfo JSONB,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2),
    deliveryFee DECIMAL(10, 2),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    deliveryMethod VARCHAR(50),
    deliveryAddress TEXT NOT NULL,
    deliveryInstructions TEXT,
    paymentMethod VARCHAR(50),
    paymentStatus VARCHAR(50) DEFAULT 'pending',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    userId UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invoiceNumber VARCHAR(50) UNIQUE NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paymentStatus VARCHAR(50) DEFAULT 'pending',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_userId ON public.orders(userId);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_invoices_userId ON public.invoices(userId);
CREATE INDEX idx_invoices_orderId ON public.invoices(orderId);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all users to access users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow all users to access products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to access orders" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access invoices" ON public.invoices
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert invoices" ON public.invoices
    FOR INSERT WITH CHECK (true);
