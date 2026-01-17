# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_01_17_121117) do
  create_schema "auth"
  create_schema "extensions"
  create_schema "graphql"
  create_schema "graphql_public"
  create_schema "pgbouncer"
  create_schema "realtime"
  create_schema "storage"
  create_schema "vault"

  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_graphql"
  enable_extension "pg_stat_statements"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "supabase_vault"
  enable_extension "uuid-ossp"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "enum_Invoices_paymentStatus", ["pending", "completed", "failed", "refunded"]
  create_enum "enum_Invoices_status", ["pending", "completed", "cancelled"]
  create_enum "enum_Orders_deliveryMethod", ["standard", "express", "same"]
  create_enum "enum_Orders_paymentMethod", ["card", "cash"]
  create_enum "enum_Orders_paymentStatus", ["pending", "paid", "failed"]
  create_enum "enum_Orders_status", ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
  create_enum "enum_invoices_paymentStatus", ["pending", "completed", "failed", "refunded"]
  create_enum "enum_invoices_status", ["pending", "completed", "cancelled"]
  create_enum "enum_users_role", ["admin", "customer"]

  create_table "Invoices", id: :serial, force: :cascade do |t|
    t.integer "orderId"
    t.integer "userId", null: false
    t.string "invoiceNumber", limit: 255, null: false
    t.decimal "totalAmount", precision: 10, scale: 2, default: "0.0", null: false
    t.json "items", default: [], null: false
    t.enum "status", default: "pending", enum_type: ""enum_Invoices_status""
    t.enum "paymentStatus", default: "pending", enum_type: ""enum_Invoices_paymentStatus""
    t.string "paymentProvider", limit: 255
    t.string "paymentReference", limit: 255
    t.string "paymentMethod", limit: 255
    t.timestamptz "paidAt"
    t.string "billingAddress", limit: 255
    t.string "billingCity", limit: 255
    t.string "billingZipCode", limit: 255
    t.string "billingCountry", limit: 255
    t.text "notes"
    t.timestamptz "createdAt", null: false
    t.timestamptz "updatedAt", null: false
  end

  create_table "Orders", id: :uuid, default: nil, force: :cascade do |t|
    t.string "orderNumber", limit: 255, null: false
    t.integer "userId"
    t.json "guestInfo"
    t.json "items", null: false
    t.decimal "subtotal", precision: 10, scale: 2, null: false
    t.decimal "deliveryFee", precision: 10, scale: 2, null: false
    t.decimal "total", precision: 10, scale: 2, null: false
    t.enum "status", default: "pending", enum_type: ""enum_Orders_status""
    t.enum "deliveryMethod", null: false, enum_type: ""enum_Orders_deliveryMethod""
    t.json "deliveryAddress", null: false
    t.text "deliveryInstructions"
    t.enum "paymentMethod", null: false, enum_type: ""enum_Orders_paymentMethod""
    t.enum "paymentStatus", default: "pending", enum_type: ""enum_Orders_paymentStatus""
    t.timestamptz "estimatedDelivery"
    t.timestamptz "actualDelivery"
    t.timestamptz "createdAt", null: false
    t.timestamptz "updatedAt", null: false
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role"
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "brands", force: :cascade do |t|
    t.string "name"
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "invoices", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.string "invoice_number"
    t.decimal "total"
    t.integer "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_invoices_on_order_id"
  end

  create_table "order_items", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.bigint "product_id", null: false
    t.integer "quantity"
    t.decimal "price", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_order_items_on_order_id"
    t.index ["product_id"], name: "index_order_items_on_product_id"
  end

  create_table "orders", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.decimal "total", precision: 10, scale: 2
    t.integer "status", default: 0
    t.text "delivery_address"
    t.decimal "delivery_fee", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.decimal "price", precision: 10, scale: 2
    t.integer "stock"
    t.text "description"
    t.string "image_url"
    t.jsonb "nutrition"
    t.string "barcode"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "category_id"
    t.bigint "brand_id"
    t.index ["brand_id"], name: "index_products_on_brand_id"
    t.index ["category_id"], name: "index_products_on_category_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "role", default: 0, null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "phone"
    t.string "address"
    t.string "zip_code"
    t.string "city"
    t.string "country"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "invoices", "orders"
  add_foreign_key "order_items", "orders"
  add_foreign_key "order_items", "products"
  add_foreign_key "orders", "users"
  add_foreign_key "products", "brands"
  add_foreign_key "products", "categories"
end
