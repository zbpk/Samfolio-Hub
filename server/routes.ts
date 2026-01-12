import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { insertProjectInquirySchema, insertOrderSchema } from "@shared/schema";
import crypto from "crypto";

// Admin password - must be set via environment variable or database
const getAdminPassword = async (): Promise<string> => {
  const storedPassword = await storage.getSetting('admin_password');
  if (storedPassword) return storedPassword;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) return envPassword;
  throw new Error("Admin password not configured. Set ADMIN_PASSWORD environment variable or configure via admin settings.");
};

// Simple token-based auth for admin routes
const adminTokens = new Set<string>();

const generateToken = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.substring(7);
  if (!adminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
  
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(200).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project inquiry submission
  app.post('/api/project-inquiry', async (req, res) => {
    try {
      const input = insertProjectInquirySchema.parse(req.body);
      const inquiry = await storage.createProjectInquiry(input);
      res.status(200).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      console.error('Project inquiry error:', err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get waitlist count
  app.get('/api/waitlist-count', async (_req, res) => {
    try {
      const count = await storage.getWaitlistCount();
      res.json({ count });
    } catch (err) {
      console.error('Waitlist count error:', err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/stripe/publishable-key', async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error('Error getting publishable key:', error);
      res.status(500).json({ error: 'Failed to get Stripe configuration' });
    }
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { 
        depositAmount, 
        packageName, 
        customerEmail, 
        customerName,
        projectDetails
      } = req.body;

      if (!depositAmount || depositAmount < 100) {
        return res.status(400).json({ error: 'Invalid deposit amount' });
      }

      const stripe = await getUncachableStripeClient();
      
      const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '');
      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = origin || (replitDomains ? `https://${replitDomains.split(',')[0]}` : `${req.protocol}://${req.get('host')}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${packageName} - 50% Deposit`,
                description: `Project deposit for ${packageName} package`,
              },
              unit_amount: depositAmount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: customerEmail,
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/start-project`,
        metadata: {
          customerName,
          customerEmail,
          packageName,
          depositAmount: depositAmount.toString(),
          projectDetails: JSON.stringify(projectDetails).slice(0, 500),
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout session error:', error);
      res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
  });

  app.get('/api/checkout-session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const stripe = await getUncachableStripeClient();
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Save payment to database if successful and not already saved
      if (session.payment_status === 'paid') {
        const existingPayment = await storage.getPaymentBySessionId(sessionId);
        if (!existingPayment) {
          await storage.createPayment({
            stripeSessionId: sessionId,
            customerName: session.metadata?.customerName || '',
            customerEmail: session.customer_email || '',
            packageName: session.metadata?.packageName || '',
            amount: session.amount_total ? Math.round(session.amount_total / 100) : 0,
            status: 'paid',
            projectDetails: session.metadata?.projectDetails || null,
          });
        }
      }
      
      res.json({
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        metadata: session.metadata,
      });
    } catch (error: any) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to retrieve session' });
    }
  });

  // ============================================
  // ADMIN API ROUTES
  // ============================================

  // Admin login - returns a token on success
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = await getAdminPassword();
      
      if (password === adminPassword) {
        const token = generateToken();
        adminTokens.add(token);
        res.json({ success: true, token });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      if (error instanceof Error && error.message.includes("Admin password not configured")) {
        res.status(503).json({ error: 'Admin portal not configured. Please set ADMIN_PASSWORD environment variable.' });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      adminTokens.delete(token);
    }
    res.json({ success: true });
  });

  // Get all inquiries (waitlist) - PROTECTED
  app.get('/api/admin/inquiries', requireAdminAuth, async (_req, res) => {
    try {
      const inquiries = await storage.getProjectInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error('Get inquiries error:', error);
      res.status(500).json({ error: 'Failed to get inquiries' });
    }
  });

  // Update inquiry - PROTECTED
  app.patch('/api/admin/inquiries/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.updateProjectInquiry(id, req.body);
      if (!inquiry) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }
      res.json(inquiry);
    } catch (error) {
      console.error('Update inquiry error:', error);
      res.status(500).json({ error: 'Failed to update inquiry' });
    }
  });

  // Delete inquiry - PROTECTED
  app.delete('/api/admin/inquiries/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProjectInquiry(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete inquiry error:', error);
      res.status(500).json({ error: 'Failed to delete inquiry' });
    }
  });

  // Move inquiry to orders - PROTECTED
  app.post('/api/admin/inquiries/:id/move-to-orders', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getProjectInquiryById(id);
      
      if (!inquiry) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }

      const order = await storage.createOrder({
        inquiryId: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        businessName: inquiry.businessName,
        projectDescription: inquiry.projectDescription,
        selectedPackage: inquiry.selectedPackage,
        rushOption: inquiry.rushOption,
        notes: inquiry.notes,
        totalPrice: inquiry.totalPrice,
        depositAmount: inquiry.depositAmount,
        depositPaid: false,
        remainingBalance: inquiry.totalPrice - inquiry.depositAmount,
        status: 'in_progress',
        estimatedDelivery: req.body.estimatedDelivery || null,
      });

      await storage.deleteProjectInquiry(id);
      res.json(order);
    } catch (error) {
      console.error('Move to orders error:', error);
      res.status(500).json({ error: 'Failed to move to orders' });
    }
  });

  // Get all orders - PROTECTED
  app.get('/api/admin/orders', requireAdminAuth, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  });

  // Update order - PROTECTED
  app.patch('/api/admin/orders/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.updateOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // Delete order - PROTECTED
  app.delete('/api/admin/orders/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  // Move order back to waitlist - PROTECTED
  app.post('/api/admin/orders/:id/move-to-waitlist', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const inquiry = await storage.createProjectInquiry({
        name: order.name,
        email: order.email,
        businessName: order.businessName,
        projectDescription: order.projectDescription,
        selectedPackage: order.selectedPackage,
        rushOption: order.rushOption,
        notes: order.notes,
        totalPrice: order.totalPrice,
        depositAmount: order.depositAmount,
        isWaitlist: false,
        waitlistPosition: null,
        status: 'pending',
      });

      await storage.deleteOrder(id);
      res.json(inquiry);
    } catch (error) {
      console.error('Move to waitlist error:', error);
      res.status(500).json({ error: 'Failed to move to waitlist' });
    }
  });

  // Get all payments - PROTECTED
  app.get('/api/admin/payments', requireAdminAuth, async (_req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ error: 'Failed to get payments' });
    }
  });

  // Get all settings - PROTECTED
  app.get('/api/admin/settings', requireAdminAuth, async (_req, res) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => { settingsMap[s.key] = s.value; });
      res.json(settingsMap);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  });

  // Update setting - PROTECTED
  app.post('/api/admin/settings', requireAdminAuth, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  // Get public settings (for main website)
  app.get('/api/settings/public', async (_req, res) => {
    try {
      const activeProjects = await storage.getSetting('active_projects') || '2';
      const deliveryTime = await storage.getSetting('delivery_time') || '2-3 weeks';
      const availability = await storage.getSetting('availability') || 'Available';
      res.json({ activeProjects: parseInt(activeProjects), deliveryTime, availability });
    } catch (error) {
      console.error('Get public settings error:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  });

  // ============================================
  // EXPENSES API ROUTES (Finance)
  // ============================================

  // Get all expenses - PROTECTED
  app.get('/api/admin/expenses', requireAdminAuth, async (_req, res) => {
    try {
      const allExpenses = await storage.getExpenses();
      res.json(allExpenses);
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ error: 'Failed to get expenses' });
    }
  });

  // Create expense - PROTECTED
  app.post('/api/admin/expenses', requireAdminAuth, async (req, res) => {
    try {
      const expense = await storage.createExpense(req.body);
      res.json(expense);
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  });

  // Update expense - PROTECTED
  app.patch('/api/admin/expenses/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.updateExpense(id, req.body);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json(expense);
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  });

  // Delete expense - PROTECTED
  app.delete('/api/admin/expenses/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpense(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });

  return httpServer;
}
