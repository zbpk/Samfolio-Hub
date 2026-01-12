import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", to: "home" },
  { name: "Services", to: "services" },
  { name: "Portfolio", to: "portfolio" },
  { name: "Pricing", to: "pricing" },
  { name: "Add-Ons", to: "addons" },
  { name: "About", to: "about" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-4 shadow-lg" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <ScrollLink
          to="home"
          smooth={true}
          duration={500}
          className="cursor-pointer"
        >
          <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Sam Digital
          </span>
        </ScrollLink>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <ScrollLink
              key={item.name}
              to={item.to}
              smooth={true}
              duration={500}
              spy={true}
              activeClass="text-primary font-semibold"
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-sm font-medium"
            >
              {item.name}
            </ScrollLink>
          ))}
          <ScrollLink to="contact" smooth={true} duration={500}>
            <Button variant="default" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              Contact Me
            </Button>
          </ScrollLink>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navItems.map((item) => (
                <ScrollLink
                  key={item.name}
                  to={item.to}
                  smooth={true}
                  duration={500}
                  className="text-foreground hover:text-primary py-2 font-medium cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </ScrollLink>
              ))}
              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full">Contact Me</Button>
              </ScrollLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
