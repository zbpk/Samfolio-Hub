import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  Zap,
  CheckCircle2,
  Send,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============================================
// MANUALLY UPDATE THIS VALUE
// ============================================
const activeProjects = 2;
// ============================================

// Pricing configuration
const packages = [
  { name: "Starter", basePrice: 600, description: "3-4 pages, mobile-friendly" },
  { name: "Standard", basePrice: 900, description: "Up to 6 pages, gallery, testimonials" },
  { name: "Premium", basePrice: 1350, description: "Full features, booking, payments" },
];

// Dynamic pricing based on workload
function getWorkloadSurcharge(projects: number): number {
  if (projects >= 5) return 300;
  if (projects >= 3) return 150;
  return 0;
}

function getDeliveryTime(projects: number): string {
  if (projects === 0) return "~1 week";
  if (projects <= 2) return "2-3 weeks";
  return "4-6 weeks";
}

function getDeliveryDays(projects: number): number {
  if (projects === 0) return 7;
  if (projects <= 2) return 21;
  return 42;
}

function getWorkloadStatus(projects: number): { label: string; color: string } {
  if (projects >= 5) return { label: "High Demand", color: "text-orange-500" };
  if (projects >= 3) return { label: "Moderate", color: "text-yellow-500" };
  return { label: "Available", color: "text-green-500" };
}

// Currency conversion
const currencyRates: { [key: string]: { symbol: string; rate: number; code: string } } = {
  'en-CA': { symbol: 'CA$', rate: 1.36, code: 'CAD' },
  'en-GB': { symbol: '£', rate: 0.79, code: 'GBP' },
  'en-AU': { symbol: 'A$', rate: 1.53, code: 'AUD' },
  'de-DE': { symbol: '€', rate: 0.92, code: 'EUR' },
  'fr-FR': { symbol: '€', rate: 0.92, code: 'EUR' },
  'ja-JP': { symbol: '¥', rate: 149, code: 'JPY' },
  'zh-CN': { symbol: '¥', rate: 7.24, code: 'CNY' },
  'in-IN': { symbol: '₹', rate: 83.12, code: 'INR' },
};

function useLocaleCurrency() {
  const [localeCurrency, setLocaleCurrency] = useState<{ symbol: string; rate: number; code: string } | null>(null);

  useEffect(() => {
    const locale = navigator.language || 'en-US';
    if (locale !== 'en-US' && currencyRates[locale]) {
      setLocaleCurrency(currencyRates[locale]);
    } else {
      const langPrefix = locale.split('-')[0];
      const matchingLocale = Object.keys(currencyRates).find(k => k.startsWith(langPrefix + '-'));
      if (matchingLocale) {
        setLocaleCurrency(currencyRates[matchingLocale]);
      }
    }
  }, []);

  return localeCurrency;
}

function formatLocalPrice(usdAmount: number, currency: { symbol: string; rate: number; code: string }) {
  const converted = Math.round(usdAmount * currency.rate);
  return `${currency.symbol}${converted.toLocaleString()} ${currency.code}`;
}

export default function StartProject() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    projectDescription: "",
    selectedPackage: 0,
    rushOption: false,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const { toast } = useToast();
  
  // Scroll to top on page load and fetch waitlist count
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch waitlist count from database
    fetch('/api/waitlist-count')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.count || 0))
      .catch(err => console.error('Failed to fetch waitlist count:', err));
  }, []);
  
  const localeCurrency = useLocaleCurrency();
  const isWaitlistMode = activeProjects >= 5;
  const surcharge = getWorkloadSurcharge(activeProjects);
  const status = getWorkloadStatus(activeProjects);
  const deliveryTime = getDeliveryTime(activeProjects);
  const deliveryDays = getDeliveryDays(activeProjects);

  // Calculate pricing
  const selectedPkg = packages[formData.selectedPackage];
  const basePrice = selectedPkg.basePrice;
  const rushFee = formData.rushOption ? 400 : 0;
  const totalPrice = basePrice + surcharge + rushFee;
  const deposit = Math.round(totalPrice * 0.5);
  const remaining = totalPrice - deposit;

  // Calculate completion date
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + deliveryDays);
  const formattedDate = completionDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const inquiryData = {
      name: formData.name,
      email: formData.email,
      businessName: formData.businessName || null,
      projectDescription: formData.projectDescription,
      selectedPackage: selectedPkg.name,
      rushOption: formData.rushOption,
      notes: formData.notes || null,
      totalPrice,
      depositAmount: deposit,
      isWaitlist: isWaitlistMode,
      waitlistPosition: isWaitlistMode ? waitlistCount + 1 : null,
      status: "not_completed",
    };

    try {
      const response = await fetch("/api/project-inquiry", {
        method: "POST",
        body: JSON.stringify(inquiryData),
        headers: { 
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: isWaitlistMode ? "Added to Waitlist" : "Inquiry Submitted",
          description: isWaitlistMode 
            ? "You've been added to the waitlist. I'll reach out when a slot opens."
            : "Thank you! I'll review your project details and get back to you within 24-48 hours.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit inquiry");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!formData.name || !formData.email || !formData.projectDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email, and project description before paying the deposit.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositAmount: deposit,
          packageName: selectedPkg.name,
          customerEmail: formData.email,
          customerName: formData.name,
          projectDetails: {
            businessName: formData.businessName,
            projectDescription: formData.projectDescription,
            rushOption: formData.rushOption,
            notes: formData.notes,
            totalPrice,
            surcharge,
            rushFee,
            deliveryTime,
            estimatedCompletion: formattedDate,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center py-20"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {isWaitlistMode ? "You're on the Waitlist!" : "Request Received!"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isWaitlistMode 
                ? `You're #${waitlistCount + 1} on the waitlist. I'll reach out as soon as a slot opens.`
                : "Thank you for your interest! I'll review your project details and get back to you within 24-48 hours."
              }
            </p>
            
            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span>{selectedPkg.name}</span>
                </div>
                {!isWaitlistMode && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold">${totalPrice} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit (50%):</span>
                      <span>${deposit} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Delivery:</span>
                      <span>{deliveryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Completion:</span>
                      <span>{formattedDate}</span>
                    </div>
                  </>
                )}
                {isWaitlistMode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waitlist Position:</span>
                    <span>#{waitlistCount + 1}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {isWaitlistMode ? "Join the Waitlist" : "Start Your Project"}
            </h1>
            <p className="text-muted-foreground">
              {isWaitlistMode 
                ? "I'm currently at capacity, but you can join the waitlist to secure your spot."
                : "Tell me about your project and I'll get back to you within 24-48 hours."
              }
            </p>
          </div>

          {/* Availability Indicator */}
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-lg font-bold ${status.color}`}>{status.label}</div>
                  <div className="text-xs text-muted-foreground">Current Status</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {deliveryTime}
                  </div>
                  <div className="text-xs text-muted-foreground">Delivery Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    {activeProjects}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Projects</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-muted-foreground">{waitlistCount}</div>
                  <div className="text-xs text-muted-foreground">On Waitlist</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isWaitlistMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-8 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-orange-500">Currently at Capacity</div>
                <p className="text-sm text-muted-foreground">
                  I'm focused on delivering quality work to current clients. Join the waitlist and I'll contact you as soon as a slot opens.
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    {isWaitlistMode 
                      ? "Provide your details to join the waitlist"
                      : "Fill out the form below to get started"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Your Business LLC"
                        data-testid="input-business"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Select Package *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {packages.map((pkg, i) => (
                          <div
                            key={i}
                            onClick={() => setFormData(prev => ({ ...prev, selectedPackage: i }))}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${formData.selectedPackage === i 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                              }
                            `}
                            data-testid={`select-package-${pkg.name.toLowerCase()}`}
                          >
                            <div className="font-semibold">{pkg.name}</div>
                            <div className="text-sm text-primary">${pkg.basePrice}</div>
                            <div className="text-xs text-muted-foreground mt-1">{pkg.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Project Description *</Label>
                      <Textarea
                        id="description"
                        required
                        value={formData.projectDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                        placeholder="Describe your project, goals, and any specific features you need..."
                        className="min-h-[120px]"
                        data-testid="input-description"
                      />
                    </div>

                    {!isWaitlistMode && (
                      <div className="space-y-2">
                        <Label>Rush Option</Label>
                        <div
                          onClick={() => setFormData(prev => ({ ...prev, rushOption: !prev.rushOption }))}
                          className={`
                            p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3
                            ${formData.rushOption 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                          data-testid="toggle-rush"
                        >
                          <Zap className={`w-5 h-5 mt-0.5 ${formData.rushOption ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              Rush Delivery (+$400)
                              {formData.rushOption && <CheckCircle2 className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Skip the queue and get priority treatment. Your project jumps to the front of the line.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any other details, preferences, or questions..."
                        data-testid="input-notes"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : isWaitlistMode ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Join Waitlist
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Live Summary Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {isWaitlistMode ? "Waitlist Info" : "Project Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Selected Package</div>
                      <div className="font-semibold">{selectedPkg.name}</div>
                    </div>

                    <Separator />

                    {!isWaitlistMode ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base Price</span>
                            <span>${basePrice}</span>
                          </div>
                          {surcharge > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-orange-500">Demand Surcharge</span>
                              <span className="text-orange-500">+${surcharge}</span>
                            </div>
                          )}
                          {rushFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-primary">Rush Fee</span>
                              <span className="text-primary">+${rushFee}</span>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${totalPrice} USD</span>
                        </div>

                        {localeCurrency && (
                          <div className="text-sm text-muted-foreground text-right">
                            ≈ {formatLocalPrice(totalPrice, localeCurrency)}
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Deposit (50%)</span>
                            <span className="text-primary font-semibold">${deposit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span>${remaining}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Delivery</span>
                            <span>{deliveryTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Est. Completion</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                        <Separator />

                        <Button
                          onClick={handlePayDeposit}
                          disabled={isProcessingPayment}
                          className="w-full"
                          size="lg"
                          data-testid="button-pay-deposit"
                        >
                          {isProcessingPayment ? (
                            "Processing..."
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay ${deposit} Deposit
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Secure payment via Stripe
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Position</span>
                          <span className="font-bold text-primary">#{waitlistCount + 1}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Waitlist</span>
                          <span>{waitlistCount} people</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Est. Wait Time</span>
                          <span>2-4 weeks</span>
                        </div>
                        <Separator />
                        <p className="text-xs text-muted-foreground">
                          Pricing will be confirmed when a slot opens. Current base price for {selectedPkg.name}: ${basePrice}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Process Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Discovery", description: "We discuss your goals and vision", icon: "search" },
                { step: 2, title: "Design", description: "I create mockups aligned with your brand", icon: "pencil" },
                { step: 3, title: "Development", description: "Building your site with clean code", icon: "code" },
                { step: 4, title: "Launch", description: "Go live with full support", icon: "rocket" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mt-16 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">What Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Sarah M.", role: "Fitness Studio Owner", quote: "Sam delivered exactly what we needed. Our booking system works flawlessly!" },
                { name: "James K.", role: "E-commerce Founder", quote: "Professional, responsive, and the final product exceeded expectations." },
                { name: "Emily R.", role: "Marketing Director", quote: "Working with Sam was a breeze. They understood our vision perfectly." },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
