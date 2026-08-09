import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  FileText,
  LogIn,
  Building2,
  ChevronDown,
  TrendingUp,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/features/auth/context/user.context";
import { getHomeRouteForRoles } from "@/lib/role-route";

/**
 * Public Landing & Welcome Portal for Palompon Institute of Technology.
 * Automatically redirects authenticated users to their primary dashboard.
 */
export const PublicLandingPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatic redirect if user is already authenticated
  useEffect(() => {
    if (!isUserLoading && user) {
      navigate(getHomeRouteForRoles(user.roles), { replace: true });
    }
  }, [user, isUserLoading, navigate]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", id: "main" },
    { label: "About", id: "about" },
    { label: "Features", id: "features" },
  ];

  const features = [
    {
      icon: BookOpen,
      label: "Student Ratings",
      tag: "SET",
      description:
        "Anonymous evaluation ratings for enrolled subjects during active evaluation windows.",
      accent: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/15 text-emerald-500",
      border: "hover:border-emerald-400/40",
      tagColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      icon: UserCheck,
      label: "Supervisor Rating",
      tag: "SEF",
      description: "Evidence-based performance assessment for Deans and Program Chairs with MOVs.",
      accent: "from-sky-500/20 to-sky-500/5",
      iconBg: "bg-sky-500/15 text-sky-500",
      border: "hover:border-sky-400/40",
      tagColor: "text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400",
    },
    {
      icon: FileText,
      label: "Consolidated Reports",
      tag: "IFER",
      description: "Automated CHED Annex C calculation combining SET and SEF ratings.",
      accent: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/15 text-violet-500",
      border: "hover:border-violet-400/40",
      tagColor: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
    },
    {
      icon: TrendingUp,
      label: "FEDAF Planning",
      tag: "Growth",
      description:
        "Development plans and formal faculty acknowledgment for instructional excellence.",
      accent: "from-amber-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/15 text-amber-500",
      border: "hover:border-amber-400/40",
      tagColor: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    },
  ];

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-xs text-muted-foreground">
        Checking session authentication...
      </div>
    );
  }

  // Prevent flash of unauthenticated landing content while redirecting
  if (user) {
    return null;
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* ── NAVIGATION ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="w-full flex justify-center px-6 lg:px-12">
          <div className="w-full max-w-7xl flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 group outline-none"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                <GraduationCap className="size-4 text-white" />
              </div>
              <div className="flex flex-col items-start gap-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm font-bold tracking-tight leading-none">PIT-FES</span>
                </div>
                <span className="hidden sm:block text-[10px] text-muted-foreground leading-none mt-0.5">
                  Palompon Institute of Technology
                </span>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Sign In CTA + mobile toggle */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate("/auth/login")}
                className="h-8 px-3.5 gap-1.5 text-xs font-semibold cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm shadow-emerald-500/20 transition-all"
              >
                <LogIn className="size-3" /> Sign In
              </Button>
              <button
                className="md:hidden flex items-center justify-center size-8 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="size-3.5" /> : <Menu className="size-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-7xl md:hidden border-t border-border/60 bg-background/95 px-6 py-2 space-y-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-all cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section id="main" className="w-full relative">
        <div
          className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1920&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-zinc-950/70" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950/50 via-transparent to-zinc-950/50" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-28 flex flex-col items-center justify-center text-center gap-6">
            {/* Headline */}
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Palompon Institute of Technology
              </p>
              <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-black tracking-tight text-white leading-[1.02]">
                Faculty <span className="text-emerald-400">Evaluation</span>
                <br />
                System
              </h1>
            </div>

            {/* Subheading */}
            <p className="max-w-lg text-[15px] sm:text-base text-zinc-400 leading-[1.7]">
              Automated SET &amp; SEF portal built per{" "}
              <span className="text-zinc-200 font-medium">
                CHED CMO No. 19, Series of 2025
              </span> —
              standardized faculty performance reviews for PIT.
            </p>

            {/* Log In CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                size="lg"
                onClick={() => navigate("/auth/login")}
                className="h-11 px-6 gap-2 font-semibold cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 text-sm"
              >
                Sign In
                <ArrowRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("about")}
                className="h-11 px-6 gap-2 font-semibold cursor-pointer border-zinc-700 text-zinc-300 hover:bg-zinc-800/70 hover:border-zinc-600 hover:text-white rounded-xl transition-all duration-200 text-sm bg-transparent"
              >
                <Building2 className="size-3.5 text-zinc-500" />
                About System
              </Button>
            </div>

            {/* Scroll cue */}
            <button
              onClick={() => scrollToSection("about")}
              className="flex flex-col items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer group pt-2"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
              <ChevronDown className="size-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section id="about" className="w-full py-20 lg:py-24">
        <div className="w-full flex flex-col items-center px-6 lg:px-12">
          <div className="w-full max-w-2xl flex flex-col items-center text-center gap-4">
            <Badge
              variant="outline"
              className="text-[11px] font-mono rounded-full px-3 py-0.5 border-primary/30 text-primary"
            >
              About PIT-FES
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug">
              Built for Academic Quality &amp; Excellence
            </h2>
            <p className="text-muted-foreground text-sm leading-[1.75] max-w-xl">
              PIT-FES is the official institutional evaluation platform of Palompon Institute of
              Technology. It streamlines multi-stakeholder ratings, generates consolidated CHED
              Individual Faculty Evaluation Reports (IFER), and tracks FEDAF development action
              plans for faculty growth.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="w-full py-20 lg:py-24 bg-muted/30">
        <div className="w-full flex flex-col items-center px-6 lg:px-12 gap-10">
          <div className="w-full max-w-lg flex flex-col items-center text-center gap-3">
            <Badge
              variant="outline"
              className="text-[11px] font-mono rounded-full px-3 py-0.5 border-primary/30 text-primary"
            >
              Core Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">System Capabilities</h2>
            <p className="text-muted-foreground text-sm leading-[1.75]">
              Integrated instruments designed for students, faculty, and academic leadership.
            </p>
          </div>

          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group relative rounded-xl border border-border/70 bg-card p-5 flex flex-col items-center text-center gap-3.5 transition-all duration-200 ${feature.border} hover:shadow-md hover:-translate-y-0.5 overflow-hidden cursor-default`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-b ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${feature.iconBg} transition-transform group-hover:scale-105 duration-200`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest rounded-full px-2 py-px ${feature.tagColor}`}
                      >
                        {feature.tag}
                      </span>
                      <h3 className="text-[13px] font-semibold text-foreground leading-snug">
                        {feature.label}
                      </h3>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-[1.65]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-border/60 bg-card mt-auto">
        <div className="w-full flex justify-center px-6 lg:px-12">
          <div className="w-full max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-7">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                  <GraduationCap className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">PIT-FES</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Palompon Institute of Technology
                  </p>
                </div>
              </div>
              <nav className="flex items-center gap-5">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="border-t border-border/50 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[10px] text-muted-foreground/50 font-mono">
                © {new Date().getFullYear()} PIT-FES. All rights reserved.
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                Evangelista St., Palompon, Leyte, Philippines
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage;
