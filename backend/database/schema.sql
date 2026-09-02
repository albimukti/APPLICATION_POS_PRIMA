-- Schema PostgreSQL untuk Aplikasi POS 16 Modul

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'cashier', -- 'admin', 'cashier', 'customer'
    phone VARCHAR(50),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules (
    id INT PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_core BOOLEAN DEFAULT FALSE,
    dependencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS module_history (
    id VARCHAR(50) PRIMARY KEY,
    module_id INT REFERENCES modules(id),
    module_key VARCHAR(50) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'ACTIVATE', 'DEACTIVATE', 'PRESET_APPLIED'
    performed_by VARCHAR(150) NOT NULL,
    performed_by_role VARCHAR(50) NOT NULL,
    details TEXT,
    snapshot_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    category_name VARCHAR(100),
    description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,
    unit VARCHAR(50) DEFAULT 'pcs',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(200),
    type VARCHAR(50) NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT', 'SALE', 'RETURN'
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reason TEXT,
    created_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    address TEXT,
    tier VARCHAR(50) DEFAULT 'Bronze', -- 'Bronze', 'Silver', 'Gold', 'Platinum'
    points INT DEFAULT 0,
    total_spent NUMERIC(15, 2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'PERCENTAGE', 'FIXED'
    discount_value NUMERIC(12, 2) NOT NULL,
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    max_discount_amount NUMERIC(12, 2) DEFAULT 0,
    quota INT DEFAULT 100,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'CASH', 'CARD', 'QRIS', 'TRANSFER', 'E_WALLET'
    fee_percentage NUMERIC(5, 2) DEFAULT 0,
    fee_fixed NUMERIC(10, 2) DEFAULT 0,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    instructions TEXT
);

CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(50) PRIMARY KEY,
    shift_number VARCHAR(50) UNIQUE NOT NULL,
    cashier_id VARCHAR(50) REFERENCES users(id),
    cashier_name VARCHAR(150) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    starting_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expected_cash NUMERIC(12, 2) DEFAULT 0,
    actual_cash NUMERIC(12, 2) DEFAULT 0,
    difference NUMERIC(12, 2) DEFAULT 0,
    total_sales NUMERIC(15, 2) DEFAULT 0,
    transaction_count INT DEFAULT 0,
    cash_sales NUMERIC(15, 2) DEFAULT 0,
    non_cash_sales NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED'
    notes TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    shift_id VARCHAR(50) REFERENCES shifts(id),
    cashier_id VARCHAR(50) REFERENCES users(id),
    cashier_name VARCHAR(150) NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(id),
    customer_name VARCHAR(150),
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_percentage NUMERIC(5, 2) DEFAULT 11.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    promo_code VARCHAR(50),
    points_used INT DEFAULT 0,
    points_discount NUMERIC(15, 2) DEFAULT 0,
    points_earned INT DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PAID', -- 'PAID', 'PENDING', 'VOID', 'REFUNDED'
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    change_amount NUMERIC(15, 2) DEFAULT 0,
    items_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'COMPLETED', -- 'COMPLETED', 'VOID', 'REFUNDED'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id VARCHAR(50) PRIMARY KEY,
    transaction_id VARCHAR(50) REFERENCES transactions(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    sku VARCHAR(50),
    product_name VARCHAR(200) NOT NULL,
    category_name VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    quantity INT NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(15, 2) NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    points_cost INT NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- 'DISCOUNT_VOUCHER', 'FREE_PRODUCT', 'CASHBACK'
    reward_value NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(150),
    basic_salary NUMERIC(12, 2) DEFAULT 0,
    commission_rate NUMERIC(5, 2) DEFAULT 0,
    today_attendance VARCHAR(50) DEFAULT 'HADIR', -- 'HADIR', 'IZIN', 'SAKIT', 'ALPHA'
    clock_in_time VARCHAR(50),
    clock_out_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'STOCK_ALERT', 'TRANSACTION', 'PROMO', 'SHIFT', 'MODULE'
    target_role VARCHAR(50) DEFAULT 'ALL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
