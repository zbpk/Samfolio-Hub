import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Project inquiries table
export const projectInquiries = pgTable("project_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  businessName: text("business_name"),
  projectDescription: text("project_description").notNull(),
  selectedPackage: text("selected_package").notNull(),
  rushOption: boolean("rush_option").default(false),
  notes: text("notes"),
  totalPrice: integer("total_price").notNull(),
  depositAmount: integer("deposit_amount").notNull(),
  isWaitlist: boolean("is_waitlist").default(false),
  waitlistPosition: integer("waitlist_position"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectInquirySchema = createInsertSchema(projectInquiries).omit({
  id: true,
  createdAt: true,
});

export type ProjectInquiry = typeof projectInquiries.$inferSelect;
export type InsertProjectInquiry = z.infer<typeof insertProjectInquirySchema>;

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  packageName: text("package_name").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  projectDetails: text("project_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Orders table (projects moved from waitlist to active work)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  businessName: text("business_name"),
  projectDescription: text("project_description").notNull(),
  selectedPackage: text("selected_package").notNull(),
  rushOption: boolean("rush_option").default(false),
  notes: text("notes"),
  totalPrice: integer("total_price").notNull(),
  depositAmount: integer("deposit_amount").notNull(),
  depositPaid: boolean("deposit_paid").default(false),
  remainingBalance: integer("remaining_balance"),
  status: text("status").default("in_progress"),
  estimatedDelivery: text("estimated_delivery"),
  completionDate: timestamp("completion_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Admin settings table
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;

// Expenses table for finance tracking
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  category: text("category").default("general"),
  notes: text("notes"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
