import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import { 
  Code2, 
  Layout, 
  Palette, 
  Server, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Cpu, 
  Store, 
  Wrench, 
  PenTool, 
  Image as ImageIcon, 
  Calendar, 
  Mail,
  Search,
  Pencil,
  Rocket,
  Quote,
  Clock,
  Users,
  Zap,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Initial workload configuration (base values)
const initialWorkloadConfig = {
  activeClients: 2, // Current number of active clients (0-2: base, 3-4: +$150, 5+: +$300)
  nextAvailableDate: "January 15, 2026",
  openSlots: 2,
  waitlistCount: 3,
};

// Workload state type
type WorkloadConfig = typeof initialWorkloadConfig;

function getWorkloadSurcharge(activeClients: number): number {
  if (activeClients >= 5) return 300;
  if (activeClients >= 3) return 150;
  return 0;
}

function getWorkloadStatus(activeClients: number): { label: string; color: string } {
  if (activeClients >= 5) return { label: "High Demand", color: "text-orange-500" };
  if (activeClients >= 3) return { label: "Moderate", color: "text-yellow-500" };
  return { label: "Available", color: "text-green-500" };
}

function getDeliveryTime(activeProjects: number): string {
  if (activeProjects === 0) return "~1 week";
  if (activeProjects <= 2) return "2–3 weeks";
  return "4–6 weeks";
}

// Currency conversion rates (approximate, USD base)
const currencyRates: { [key: string]: { symbol: string; rate: number; code: string } } = {
  'en-CA': { symbol: 'CA$', rate: 1.36, code: 'CAD' },
  'en-GB': { symbol: '£', rate: 0.79, code: 'GBP' },
  'en-AU': { symbol: 'A$', rate: 1.53, code: 'AUD' },
  'de-DE': { symbol: '€', rate: 0.92, code: 'EUR' },
  'fr-FR': { symbol: '€', rate: 0.92, code: 'EUR' },
  'es-ES': { symbol: '€', rate: 0.92, code: 'EUR' },
  'it-IT': { symbol: '€', rate: 0.92, code: 'EUR' },
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Pricing data
const pricingPlans = [
  {
    name: "Starter",
    tagline: "Get Online",
    price: "from $600 USD",
    usdAmount: 600,
    summary: "Simple website to launch your online presence.",
    features: [
      "3-4 pages",
      "Mobile-friendly",
      "Basic SEO",
      "Contact form",
      "Social links",
      "Hosting help"
    ]
  },
  {
    name: "Standard",
    tagline: "Grow Your Brand",
    price: "from $900 USD",
    usdAmount: 900,
    summary: "Enhanced site with portfolio and interactive features.",
    features: [
      "Up to 6 pages",
      "Portfolio/gallery",
      "Testimonials",
      "Custom graphics",
      "Analytics",
      "Animations"
    ]
  },
  {
    name: "Premium",
    tagline: "Full Business Solution",
    price: "$1200–$1500 USD",
    usdAmount: 1350,
    summary: "Complete platform with booking and payments.",
    isPremium: true,
    features: [
      "Booking system",
      "Payments",
      "Admin dashboard",
      "User accounts",
      "Advanced SEO",
      "Priority support"
    ]
  }
];

// Process steps
const processSteps = [
  {
    icon: Search,
    title: "Discovery",
    description: "We discuss your goals, target audience, and vision to create a clear project roadmap."
  },
  {
    icon: Pencil,
    title: "Design",
    description: "I craft wireframes and mockups that align with your brand and user experience goals."
  },
  {
    icon: Code2,
    title: "Development",
    description: "Your design comes to life with clean, responsive code and modern technologies."
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "We test thoroughly, deploy your site, and provide training and ongoing support."
  }
];

// Testimonials
const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Bloom Wellness",
    quote: "Sam Digital transformed our online presence. The website exceeded our expectations and our bookings increased by 40% within the first month."
  },
  {
    name: "James Rodriguez",
    role: "CEO, TechStart Solutions",
    quote: "Professional, responsive, and incredibly talented. Sam delivered a complex web application on time and within budget. Highly recommended!"
  },
  {
    name: "Emily Chen",
    role: "Owner, Artisan Coffee Co.",
    quote: "Working with Sam was a breeze. They understood our vision perfectly and created a beautiful site that truly represents our brand."
  }
];

function AvailabilityIndicator({ workload }: { workload: WorkloadConfig }) {
  const status = getWorkloadStatus(workload.activeClients);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card/50 border border-border/50 rounded-lg p-6 mb-8"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Current Availability
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{workload.nextAvailableDate}</div>
          <div className="text-xs text-muted-foreground mt-1">Next Available Start</div>
        </div>
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <motion.div 
            key={workload.openSlots}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-primary"
          >
            {workload.openSlots}
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">Open Slots</div>
        </div>
        <div className="text-center p-3 bg-secondary/30 rounded-lg">
          <div className={`text-2xl font-bold ${status.color}`}>{status.label}</div>
          <motion.div 
            key={workload.waitlistCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xs text-muted-foreground mt-1"
          >
            {workload.waitlistCount} on waitlist
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function WaitlistForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/YOURFORMID", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      
      if (response.ok) {
        setSubmitted(true);
        onSuccess();
      }
    } catch (error) {
      console.error("Waitlist submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
          <p className="text-muted-foreground mb-6">
            We'll notify you as soon as a spot opens up. Thank you for your interest!
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-8 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Join the Waitlist</h3>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Get notified when a project slot becomes available. No commitment required.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              name="name"
              placeholder="Your name"
              required
              className="w-full"
              data-testid="input-waitlist-name"
            />
          </div>
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Your email"
              required
              className="w-full"
              data-testid="input-waitlist-email"
            />
          </div>
          <input type="hidden" name="form_type" value="waitlist" />
          <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-waitlist-submit">
            {isSubmitting ? "Submitting..." : "Join Waitlist"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function RushOption() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg p-6 mt-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            Skip the Waitlist
            <span className="text-sm font-normal bg-primary/20 text-primary px-2 py-0.5 rounded">Rush +$300–$500</span>
          </h3>
          <p className="text-muted-foreground text-sm">
            Need your project completed sooner? Rush projects jump to the front of the queue with dedicated priority attention. 
            Perfect for time-sensitive launches or urgent business needs.
          </p>
        </div>
        <ScrollLink to="contact" smooth={true} duration={500}>
          <Button variant="outline" className="shrink-0" data-testid="button-rush-project">
            Inquire Now
          </Button>
        </ScrollLink>
      </div>
    </motion.div>
  );
}

function PricingCards() {
  const [openCards, setOpenCards] = useState<{ [key: number]: boolean }>({});
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [workload, setWorkload] = useState<WorkloadConfig>(initialWorkloadConfig);
  const localeCurrency = useLocaleCurrency();
  const surcharge = getWorkloadSurcharge(workload.activeClients);

  const toggleCard = (index: number) => {
    setOpenCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleWaitlistSuccess = () => {
    setWorkload(prev => ({
      ...prev,
      waitlistCount: prev.waitlistCount + 1,
    }));
  };

  return (
    <>
      <AvailabilityIndicator workload={workload} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
        {pricingPlans.map((plan, i) => {
          const isOpen = openCards[i] || false;
          const isPremium = plan.isPremium;
          const adjustedPrice = plan.usdAmount + surcharge;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="h-full"
          >
            <Card
              className={`
                h-full flex flex-col relative overflow-visible
                transition-all duration-500 ease-out border-2
                ${isPremium && isOpen 
                  ? 'scale-[1.02] shadow-2xl shadow-primary/30 border-primary ring-2 ring-primary/20' 
                  : isPremium 
                    ? 'border-primary/50 shadow-lg shadow-primary/10' 
                    : 'bg-card/50 border-border/80 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30'
                }
                ${!isPremium ? 'hover:scale-[1.02]' : ''}
              `}
              data-testid={`card-pricing-${plan.name.toLowerCase()}`}
            >
              {isPremium && (
                <div className={`
                  absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground 
                  text-xs font-bold px-4 py-1 rounded-full
                  transition-all duration-500
                  ${isOpen ? 'shadow-lg shadow-primary/50' : ''}
                `}>
                  MOST POPULAR
                </div>
              )}
              
              <CardHeader className="pb-8 space-y-5">
                <motion.div
                  animate={isPremium && isOpen ? { y: -5, opacity: 1 } : { y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                    {(plan as { tagline?: string }).tagline || plan.name}
                  </div>
                  <CardTitle className={`text-2xl transition-all duration-300 ${isPremium && isOpen ? 'text-primary' : ''}`}>
                    {plan.name}
                  </CardTitle>
                </motion.div>
                
                <Separator className="opacity-50" />
                
                <motion.div 
                  className="space-y-2"
                  animate={isPremium && isOpen ? { y: -5, scale: 1.05 } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
                >
                  <span className={`text-3xl font-bold transition-all duration-300 ${isPremium && isOpen ? 'text-primary' : ''}`}>
                    {surcharge > 0 
                      ? `from $${adjustedPrice} USD`
                      : plan.price
                    }
                  </span>
                  {surcharge > 0 && (
                    <span className="block text-xs text-orange-500">
                      +${surcharge} high demand surcharge
                    </span>
                  )}
                  {localeCurrency && (
                    <span className="block text-sm text-muted-foreground">
                      ≈ {formatLocalPrice(adjustedPrice, localeCurrency)}
                    </span>
                  )}
                </motion.div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  Delivery: {getDeliveryTime(workload.activeClients)}
                </div>
                
                <CardDescription className="text-sm pt-2">{plan.summary}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow pt-0">
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-out
                    ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <Separator className="mb-4" />
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={false}
                        animate={isOpen ? { 
                          opacity: 1, 
                          x: 0,
                          transition: { 
                            delay: isPremium ? idx * 0.08 : idx * 0.03,
                            duration: 0.3 
                          }
                        } : { 
                          opacity: 0, 
                          x: -10 
                        }}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className={`w-4 h-4 mr-2 flex-shrink-0 transition-colors duration-300 ${isPremium ? 'text-primary' : 'text-primary/70'}`} />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-6 mt-auto">
                <Button
                  variant="outline"
                  className={`
                    w-full transition-all duration-300
                    ${isOpen ? 'bg-secondary/50' : ''}
                  `}
                  onClick={() => toggleCard(i)}
                  data-testid={`button-details-${plan.name.toLowerCase()}`}
                >
                  <span className="transition-all duration-200">
                    {isOpen ? "Hide Details" : "See Details"}
                  </span>
                </Button>
                <ScrollLink to="contact" smooth={true} duration={500} className="w-full">
                  <Button 
                    className={`
                      w-full transition-all duration-300
                      ${isPremium 
                        ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' 
                        : ''
                      }
                    `}
                    variant={isPremium ? "default" : "secondary"}
                    data-testid={`button-getstarted-${plan.name.toLowerCase()}`}
                  >
                    Inquiries
                  </Button>
                </ScrollLink>
              </CardFooter>
            </Card>
          </motion.div>
        );
        })}
      </div>

      <div className="max-w-6xl mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            onClick={() => setShowWaitlist(true)}
            className="flex items-center gap-2"
            data-testid="button-join-waitlist"
          >
            <Users className="w-4 h-4" />
            Join the Waitlist
          </Button>
        </motion.div>
      </div>

      <RushOption />

      {showWaitlist && <WaitlistForm onClose={() => setShowWaitlist(false)} onSuccess={handleWaitlistSuccess} />}
    </>
  );
}

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  // Hidden admin access via keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setLocation('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/YOURFORMID", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      
      if (response.ok) {
        setFormSubmitted(true);
        form.reset();
      } else {
        console.error("Form submission failed:", response.statusText);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-6"
          >
            <motion.div variants={fadeInUp}>
               <span className="inline-block px-3 py-1 rounded-full bg-secondary text-primary text-sm font-semibold mb-6 border border-primary/20">
                Available for Freelance Work
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-display font-bold leading-tight"
            >
              Hi, I’m Sam.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Web Developer & App Builder
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Building modern websites and digital platforms that help businesses grow. 
              Clean code, stunning design, and exceptional performance.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            >
              <ScrollLink to="contact" smooth={true} duration={500}>
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                  Hire Me
                </Button>
              </ScrollLink>
              <ScrollLink to="portfolio" smooth={true} duration={500}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover:bg-secondary/50 transition-all">
                  View My Work
                </Button>
              </ScrollLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What I Do</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive web solutions tailored to your specific needs.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Code2, title: "Custom Websites", desc: "Fast, responsive websites built with modern technologies like React and Tailwind." },
              { icon: Layout, title: "Web Apps & Dashboards", desc: "Complex applications and admin panels to manage your business data efficiently." },
              { icon: Palette, title: "UI/UX Design", desc: "Beautiful, user-centric interfaces that engage visitors and drive conversions." },
              { icon: Server, title: "Full Setup", desc: "Complete handling of hosting, domain configuration, and basic SEO setup." }
            ].map((service, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="h-full hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      <service.icon size={24} />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Projects</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A selection of my recent work building digital products.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000" 
                    alt="Fitness Platform Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Fitness Platform AI
                    <Cpu className="text-primary w-5 h-5" />
                  </CardTitle>
                  <CardDescription>Personalized workout generation engine</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    An intelligent fitness application that creates custom workout plans based on user goals and equipment availability using AI algorithms.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <a href="https://fit-plan-ai--spacedog2.replit.app/" target="_blank" rel="noopener noreferrer">
                      Visit Project <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img 
                    src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1000" 
                    alt="Academix Platform Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Academix Platform
                    <Server className="text-primary w-5 h-5" />
                  </CardTitle>
                  <CardDescription>Educational management system</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    A comprehensive platform for educational institutions to manage courses, students, and learning materials in a centralized hub.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <a href="https://academix.replit.app/" target="_blank" rel="noopener noreferrer">
                      Visit Project <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">My Process</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A streamlined approach to bringing your vision to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 text-center group">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-sm font-bold text-primary mb-2">Step {i + 1}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Clients Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by businesses to deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, x: i === 0 ? -20 : i === 2 ? 20 : 0 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="pt-6">
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground italic mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <span className="text-primary font-bold text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the package that fits your project requirements.
            </p>
          </motion.div>

          <PricingCards />
        </div>
      </section>

      {/* Add-Ons & Domains Section */}
      <section id="addons" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Additional Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Layout, label: "Extra Pages" },
                  { icon: Store, label: "Online Store Setup" },
                  { icon: Wrench, label: "Monthly Maintenance" },
                  { icon: PenTool, label: "Content Writing" },
                  { icon: ImageIcon, label: "Photo Editing" },
                  { icon: Calendar, label: "Booking Calendar" },
                  { icon: Mail, label: "Email Newsletter" },
                  { icon: Server, label: "Hosting Migration" },
                ].map((addon, i) => (
                  <div key={i} className="flex items-center p-4 bg-card rounded-lg border border-border/50">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3 text-primary">
                      <addon.icon size={16} />
                    </div>
                    <span className="font-medium">{addon.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-secondary/30 rounded-2xl p-8 border border-border"
            >
              <h2 className="text-3xl font-bold mb-6">Custom Domains</h2>
              <p className="text-muted-foreground mb-8">
                Need a professional domain name? I can handle the registration and setup for you.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 text-primary shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Setup Fee</h3>
                    <p className="text-2xl font-bold text-primary">$50 <span className="text-sm font-normal text-muted-foreground">one-time</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Includes DNS configuration and SSL certificate setup.</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-border ml-5"></div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 text-primary shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Domain Cost</h3>
                    <p className="text-2xl font-bold text-primary">$15–$20 <span className="text-sm font-normal text-muted-foreground">per year</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Direct cost for domain registration (e.g., .com, .net).</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            About Me
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            I'm a passionate freelance developer who loves turning complex problems into simple, beautiful, and intuitive designs. With years of experience in web technologies, I focus on creating websites that not only look good but perform flawlessly on every device. When I'm not coding, you can find me exploring new tech trends or optimizing digital workflows.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Inquiries</h2>
            <p className="text-muted-foreground text-lg">
              Have a project in mind? Let's discuss how we can work together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-2xl shadow-primary/5 border-primary/20">
              <CardContent className="pt-6">
                {!formSubmitted ? (
                  <form 
                    id="contactForm" 
                    action="https://formspree.io/f/YOURFORMID" 
                    method="POST"
                    onSubmit={handleContactSubmit}
                    className="space-y-6"
                    data-testid="form-contact"
                  >
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Name
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        id="name"
                        placeholder="Your Name" 
                        required
                        className="flex h-12 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid="input-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Email
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        id="email"
                        placeholder="Your Email" 
                        required
                        className="flex h-12 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Message
                      </label>
                      <textarea 
                        name="message" 
                        id="message"
                        placeholder="Your Message" 
                        required
                        className="flex min-h-[150px] w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                      disabled={isSubmitting}
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                          Sending...
                        </div>
                      ) : (
                        <>Inquiries <ArrowRight className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  </form>
                ) : (
                  <p 
                    id="successMessage" 
                    className="text-center text-lg py-8 text-green-500"
                    data-testid="text-success-message"
                  >
                    Message sent!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
        </div>
      </section>

      {/* Start Your Project Section */}
      <section id="start-project" className="py-24 bg-gradient-to-b from-primary/10 to-background border-t border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Start Your Project</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Ready to bring your vision to life? Begin the intake process and let's build something amazing together.
            </p>
            <Link href="/start-project">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all" data-testid="button-start-process">
                Start the Process
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border relative">
        <div className="container mx-auto px-4 text-center">
          <span className="text-2xl font-display font-bold text-foreground">Sam Digital</span>
          <p className="text-muted-foreground text-sm mt-2">
            © {new Date().getFullYear()} Sam Digital. All rights reserved.
          </p>
        </div>
        {/* Hidden admin access button - invisible but clickable */}
        <button
          onClick={() => setLocation('/admin')}
          className="absolute bottom-2 right-2 w-4 h-4 opacity-0 hover:opacity-5 cursor-default"
          aria-hidden="true"
          tabIndex={-1}
          data-testid="button-hidden-admin"
        />
      </footer>
    </div>
  );
}
