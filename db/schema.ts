import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const userRole = pgEnum("user_role", ["customer", "editor", "manager", "admin"]);
export const orderStatus = pgEnum("order_status", ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const inventoryMovementType = pgEnum("inventory_movement_type", ["in", "out", "adjustment", "return"]);
export const discountType = pgEnum("discount_type", ["percent", "fixed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 80 }), lastName: varchar("last_name", { length: 80 }),
  email: varchar("email", { length: 255 }).notNull().unique(), phone: varchar("phone", { length: 32 }),
  passwordHash: text("password_hash").notNull(), role: userRole("role").default("customer").notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(), lastLoginAt: timestamp("last_login_at", { withTimezone: true }), ...timestamps,
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 80 }).notNull(), recipientName: varchar("recipient_name", { length: 160 }).notNull(), phone: varchar("phone", { length: 32 }).notNull(),
  city: varchar("city", { length: 80 }).notNull(), district: varchar("district", { length: 80 }).notNull(), neighborhood: varchar("neighborhood", { length: 120 }),
  addressLine: text("address_line").notNull(), postalCode: varchar("postal_code", { length: 16 }), isDefault: boolean("is_default").default(false).notNull(), ...timestamps,
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(), name: varchar("name", { length: 120 }).notNull(), slug: varchar("slug", { length: 150 }).notNull().unique(),
  description: text("description"), imageUrl: text("image_url"), sortOrder: integer("sort_order").default(0).notNull(), isActive: boolean("is_active").default(true).notNull(),
  seoTitle: varchar("seo_title", { length: 160 }), seoDescription: varchar("seo_description", { length: 320 }), ...timestamps,
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(), categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 180 }).notNull(), slug: varchar("slug", { length: 200 }).notNull().unique(),
  shortDescription: varchar("short_description", { length: 500 }), description: text("description"), fragranceNotes: jsonb("fragrance_notes").$type<string[]>(),
  isFeatured: boolean("is_featured").default(false).notNull(), isActive: boolean("is_active").default(true).notNull(),
  seoTitle: varchar("seo_title", { length: 160 }), seoDescription: varchar("seo_description", { length: 320 }), ...timestamps,
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(), productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(), sku: varchar("sku", { length: 100 }).notNull().unique(), volumeMl: integer("volume_ml"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }),
  stockQuantity: integer("stock_quantity").default(0).notNull(), lowStockThreshold: integer("low_stock_threshold").default(5).notNull(), isActive: boolean("is_active").default(true).notNull(), ...timestamps,
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(), productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(), altText: varchar("alt_text", { length: 200 }), sortOrder: integer("sort_order").default(0).notNull(), ...timestamps,
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(), variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
  type: inventoryMovementType("type").notNull(), quantity: integer("quantity").notNull(), note: varchar("note", { length: 255 }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(), userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 120 }).unique(), couponCode: varchar("coupon_code", { length: 64 }), ...timestamps,
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(), cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }), quantity: integer("quantity").notNull(), ...timestamps,
});

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(), code: varchar("code", { length: 64 }).notNull().unique(), type: discountType("type").notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(), minimumOrderAmount: numeric("minimum_order_amount", { precision: 12, scale: 2 }),
  usageLimit: integer("usage_limit"), usageCount: integer("usage_count").default(0).notNull(), startsAt: timestamp("starts_at", { withTimezone: true }), endsAt: timestamp("ends_at", { withTimezone: true }), isActive: boolean("is_active").default(true).notNull(), ...timestamps,
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(), orderNumber: varchar("order_number", { length: 32 }).notNull().unique(), userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: orderStatus("status").default("pending").notNull(), paymentStatus: paymentStatus("payment_status").default("pending").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(), shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 }).default("0").notNull(), discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(), totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(), couponCode: varchar("coupon_code", { length: 64 }),
  shippingAddress: jsonb("shipping_address").$type<Record<string, string>>().notNull(), billingAddress: jsonb("billing_address").$type<Record<string, string>>(),
  cargoCompany: varchar("cargo_company", { length: 100 }), cargoTrackingNumber: varchar("cargo_tracking_number", { length: 120 }), customerNote: text("customer_note"), ...timestamps,
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(), orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }), variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 180 }).notNull(), variantName: varchar("variant_name", { length: 120 }), sku: varchar("sku", { length: 100 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(), quantity: integer("quantity").notNull(), lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(), value: jsonb("value").notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productReviews = pgTable("product_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 180 }),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  ...timestamps,
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: varchar("user_name", { length: 160 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  userRole: varchar("user_role", { length: 40 }).default("admin").notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: varchar("entity_id", { length: 120 }),
  description: text("description").notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
