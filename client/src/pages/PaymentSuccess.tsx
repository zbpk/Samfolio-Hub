import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Mail, Clock } from "lucide-react";

interface SessionData {
  status: string;
  customerEmail: string;
  amountTotal: number;
  metadata: {
    customerName: string;
    packageName: string;
    depositAmount: string;
  };
}

export default function PaymentSuccess() {
  const [location] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      fetch(`/api/checkout-session/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setSessionData(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load payment details");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Payment Successful
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground text-lg">
                Thank you for your deposit! Your project is now officially underway.
              </p>

              {sessionData && (
                <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-semibold">{sessionData.metadata?.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Deposit Paid</span>
                    <span className="font-semibold text-green-500">
                      ${sessionData.amountTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-green-500 capitalize">
                      {sessionData.status === "paid" ? "Confirmed" : sessionData.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                  <Mail className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Check Your Email</h4>
                    <p className="text-sm text-muted-foreground">
                      A confirmation email with project details has been sent to{" "}
                      {sessionData?.customerEmail || "your email address"}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg">
                  <Clock className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">What Happens Next</h4>
                    <p className="text-sm text-muted-foreground">
                      I'll reach out within 24-48 hours to schedule our kickoff call and discuss your project in detail.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-back-home"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
