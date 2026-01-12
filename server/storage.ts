import { db } from "./db";
import { 
  messages, 
  projectInquiries,
  payments,
  orders,
  adminSettings,
  expenses,
  type Message, 
  type InsertMessage,
  type ProjectInquiry,
  type InsertProjectInquiry,
  type Payment,
  type InsertPayment,
  type Order,
  type InsertOrder,
  type AdminSetting,
  type InsertAdminSetting,
  type Expense,
  type InsertExpense
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  createProjectInquiry(inquiry: InsertProjectInquiry): Promise<ProjectInquiry>;
  getProjectInquiries(): Promise<ProjectInquiry[]>;
  getProjectInquiryById(id: number): Promise<ProjectInquiry | null>;
  updateProjectInquiry(id: number, data: Partial<InsertProjectInquiry>): Promise<ProjectInquiry | null>;
  deleteProjectInquiry(id: number): Promise<boolean>;
  getWaitlistCount(): Promise<number>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(): Promise<Payment[]>;
  getPaymentBySessionId(sessionId: string): Promise<Payment | null>;
  updatePaymentStatus(sessionId: string, status: string): Promise<Payment | null>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | null>;
  updateOrder(id: number, data: Partial<InsertOrder>): Promise<Order | null>;
  deleteOrder(id: number): Promise<boolean>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<AdminSetting>;
  getAllSettings(): Promise<AdminSetting[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  updateExpense(id: number, data: Partial<InsertExpense>): Promise<Expense | null>;
  deleteExpense(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async createProjectInquiry(inquiry: InsertProjectInquiry): Promise<ProjectInquiry> {
    const [result] = await db.insert(projectInquiries).values(inquiry).returning();
    return result;
  }

  async getProjectInquiries(): Promise<ProjectInquiry[]> {
    return await db.select().from(projectInquiries).orderBy(desc(projectInquiries.createdAt));
  }

  async getProjectInquiryById(id: number): Promise<ProjectInquiry | null> {
    const [result] = await db.select().from(projectInquiries).where(eq(projectInquiries.id, id));
    return result || null;
  }

  async updateProjectInquiry(id: number, data: Partial<InsertProjectInquiry>): Promise<ProjectInquiry | null> {
    const [result] = await db.update(projectInquiries)
      .set(data)
      .where(eq(projectInquiries.id, id))
      .returning();
    return result || null;
  }

  async deleteProjectInquiry(id: number): Promise<boolean> {
    const result = await db.delete(projectInquiries).where(eq(projectInquiries.id, id));
    return true;
  }

  async getWaitlistCount(): Promise<number> {
    const waitlistEntries = await db.select().from(projectInquiries).where(eq(projectInquiries.isWaitlist, true));
    return waitlistEntries.length;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(payment).returning();
    return result;
  }

  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentBySessionId(sessionId: string): Promise<Payment | null> {
    const [result] = await db.select().from(payments).where(eq(payments.stripeSessionId, sessionId));
    return result || null;
  }

  async updatePaymentStatus(sessionId: string, status: string): Promise<Payment | null> {
    const [result] = await db.update(payments)
      .set({ status })
      .where(eq(payments.stripeSessionId, sessionId))
      .returning();
    return result || null;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<Order | null> {
    const [result] = await db.select().from(orders).where(eq(orders.id, id));
    return result || null;
  }

  async updateOrder(id: number, data: Partial<InsertOrder>): Promise<Order | null> {
    const [result] = await db.update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result || null;
  }

  async deleteOrder(id: number): Promise<boolean> {
    await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  async getSetting(key: string): Promise<string | null> {
    const [result] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return result?.value || null;
  }

  async setSetting(key: string, value: string): Promise<AdminSetting> {
    const existing = await this.getSetting(key);
    if (existing !== null) {
      const [result] = await db.update(adminSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(adminSettings.key, key))
        .returning();
      return result;
    }
    const [result] = await db.insert(adminSettings).values({ key, value }).returning();
    return result;
  }

  async getAllSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [result] = await db.insert(expenses).values(expense).returning();
    return result;
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async updateExpense(id: number, data: Partial<InsertExpense>): Promise<Expense | null> {
    const [result] = await db.update(expenses)
      .set(data)
      .where(eq(expenses.id, id))
      .returning();
    return result || null;
  }

  async deleteExpense(id: number): Promise<boolean> {
    await db.delete(expenses).where(eq(expenses.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
