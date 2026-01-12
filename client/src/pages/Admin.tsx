import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  CheckCircle2, 
  DollarSign,
  LogOut,
  Check,
  Minus,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";

type Order = {
  id: number;
  inquiryId: number | null;
  name: string;
  email: string;
  businessName: string | null;
  projectDescription: string;
  selectedPackage: string;
  rushOption: boolean | null;
  notes: string | null;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean | null;
  remainingBalance: number | null;
  status: string | null;
  estimatedDelivery: string | null;
  completionDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type Payment = {
  id: number;
  stripeSessionId: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  amount: number;
  status: string;
  projectDetails: string | null;
  createdAt: string | null;
};

type Expense = {
  id: number;
  description: string;
  amount: number;
  category: string | null;
  notes: string | null;
  date: string | null;
  createdAt: string | null;
};

const statusConfig: Record<string, { icon: typeof Check; color: string; label: string; bgColor: string }> = {
  pending: { icon: AlertTriangle, color: "text-yellow-500", label: "Pending", bgColor: "bg-yellow-500/10" },
  in_progress: { icon: Minus, color: "text-blue-500", label: "In Progress", bgColor: "bg-blue-500/10" },
  completed: { icon: Check, color: "text-green-500", label: "Completed", bgColor: "bg-green-500/10" },
  cancelled: { icon: X, color: "text-red-500", label: "Cancelled", bgColor: "bg-red-500/10" },
};

const getAuthToken = (): string | null => localStorage.getItem("adminToken");

const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
};

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        onLogin(data.token);
      } else {
        const errorData = await response.json();
        toast({
          title: "Access Denied",
          description: errorData.error || "Invalid password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4"
            onClick={() => window.location.href = '/'}
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sam Digital Admin</CardTitle>
          <CardDescription>Enter your password to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-testid="input-admin-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-admin-login">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 100;
  
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {expanded || !isLong ? text : `${text.slice(0, 100)}...`}
      </p>
      {isLong && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary p-0 h-auto mt-1"
        >
          {expanded ? (
            <>Show Less <ChevronUp className="w-3 h-3 ml-1" /></>
          ) : (
            <>Show More <ChevronDown className="w-3 h-3 ml-1" /></>
          )}
        </Button>
      )}
    </div>
  );
}

function StatusBadge({ status, onStatusChange }: { status: string; onStatusChange?: (status: string) => void }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  if (!onStatusChange) {
    return (
      <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(statusConfig).map(([key, cfg]) => {
        const StatusIcon = cfg.icon;
        const isActive = status === key;
        return (
          <Button
            key={key}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`text-xs ${isActive ? cfg.bgColor + ' ' + cfg.color : ''}`}
            onClick={() => onStatusChange(key)}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {cfg.label}
          </Button>
        );
      })}
    </div>
  );
}

function OrdersTab({ onOrderCompleted }: { onOrderCompleted: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await authFetch("/api/admin/orders");
      if (!response.ok) throw new Error("Unauthorized");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrder = async (id: number, updates: Partial<Order>) => {
    try {
      // If marking as completed, set completion date
      if (updates.status === 'completed') {
        updates.completionDate = new Date().toISOString();
      }
      
      await authFetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
      toast({ title: "Updated", description: "Order updated successfully" });
      
      if (updates.status === 'completed') {
        onOrderCompleted();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await authFetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      setOrders(prev => prev.filter(o => o.id !== id));
      toast({ title: "Deleted", description: "Order deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading orders...</div>;

  // Filter active orders (not completed)
  const activeOrders = orders.filter(o => o.status !== 'completed');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Orders</h2>
        <Badge variant="secondary">{activeOrders.length} orders</Badge>
      </div>

      {activeOrders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active orders
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => (
            <Card key={order.id} className={order.status === 'cancelled' ? 'opacity-60 border-red-500/30' : ''}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-2">
                    <p className="font-medium">{order.name}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <Badge variant="outline">{order.selectedPackage}</Badge>
                    <p className="text-sm font-medium mt-1">${order.totalPrice}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <ExpandableDescription text={order.projectDescription} />
                  </div>
                  <div className="lg:col-span-3">
                    <StatusBadge 
                      status={order.status || "pending"} 
                      onStatusChange={(status) => updateOrder(order.id, { status })}
                    />
                  </div>
                  <div className="lg:col-span-2 flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOrder(order.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FinishedProjectsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await authFetch("/api/admin/orders");
      if (!response.ok) throw new Error("Unauthorized");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;

  // Filter completed orders
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Finished Projects</h2>
        <Badge variant="secondary">{completedOrders.length} completed</Badge>
      </div>

      {completedOrders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No completed projects yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {completedOrders.map((order) => (
            <Card key={order.id} className="border-green-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-2">
                    <p className="font-medium">{order.name}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <Badge variant="outline">{order.selectedPackage}</Badge>
                    <p className="text-sm font-medium mt-1">${order.totalPrice}</p>
                  </div>
                  <div className="lg:col-span-4">
                    <ExpandableDescription text={order.projectDescription} />
                  </div>
                  <div className="lg:col-span-2">
                    <StatusBadge status="completed" />
                  </div>
                  <div className="lg:col-span-2 text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                      <Calendar className="w-3 h-3" />
                      {order.completionDate 
                        ? new Date(order.completionDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FinanceTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'general', notes: '' });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [paymentsRes, expensesRes] = await Promise.all([
        authFetch("/api/admin/payments"),
        authFetch("/api/admin/expenses")
      ]);
      
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load finance data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast({ title: "Error", description: "Please fill in description and amount", variant: "destructive" });
      return;
    }
    try {
      const response = await authFetch("/api/admin/expenses", {
        method: "POST",
        body: JSON.stringify({
          description: newExpense.description,
          amount: Math.round(parseFloat(newExpense.amount) * 100),
          category: newExpense.category,
          notes: newExpense.notes || null,
          date: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        const expense = await response.json();
        setExpenses(prev => [expense, ...prev]);
        setNewExpense({ description: '', amount: '', category: 'general', notes: '' });
        setShowAddExpense(false);
        toast({ title: "Added", description: "Expense added successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add expense", variant: "destructive" });
    }
  };

  const deleteExpense = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await authFetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast({ title: "Deleted", description: "Expense deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading finance data...</div>;

  // Calculate totals (amounts stored in cents)
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-green-500">
              <TrendingUp className="w-5 h-5" />
              ${(totalRevenue / 100).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2 text-red-500">
              <TrendingDown className="w-5 h-5" />
              ${(totalExpenses / 100).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Profit</CardDescription>
            <CardTitle className={`text-2xl flex items-center gap-2 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <DollarSign className="w-5 h-5" />
              ${(netProfit / 100).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Payments Received */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payments Received</CardTitle>
          <CardDescription>Revenue from completed payments</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No payments yet</p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 10).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className="font-medium">{payment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{payment.packageName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-500">${(payment.amount / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Expenses</CardTitle>
            <CardDescription>Track your business expenses</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddExpense(!showAddExpense)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          {showAddExpense && (
            <div className="mb-4 p-4 border rounded-md space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Software subscription"
                  />
                </div>
                <div>
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addExpense}>Save Expense</Button>
                <Button variant="outline" onClick={() => setShowAddExpense(false)}>Cancel</Button>
              </div>
            </div>
          )}
          
          {expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No expenses recorded</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    {expense.notes && <p className="text-sm text-muted-foreground">{expense.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-red-500">-${(expense.amount / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    }
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };

  const handleOrderCompleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={(token: string) => {
      localStorage.setItem("adminToken", token);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-2">
          <h1 className="text-xl font-bold text-primary">Sam Digital Admin</h1>
          <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="orders" data-testid="tab-orders" className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="finished" data-testid="tab-finished" className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Finished</span>
            </TabsTrigger>
            <TabsTrigger value="finance" data-testid="tab-finance" className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Finance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab key={refreshKey} onOrderCompleted={handleOrderCompleted} />
          </TabsContent>
          <TabsContent value="finished">
            <FinishedProjectsTab key={refreshKey} />
          </TabsContent>
          <TabsContent value="finance">
            <FinanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
