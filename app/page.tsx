import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Layers,
  Users,
  Zap,
  Shield,
  CheckCircle2,
} from "lucide-react";

export default async function Home() {
  const session = await getSession();

  if (session?.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-[980px]">
          <div className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
            PM
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost" className="text-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-16 max-w-[980px]">
        <div className="text-center space-y-6">
          <h1 className="text-[56px] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1D1D1F]">
            Project management
            <br />
            made simple
          </h1>
          <p className="text-[21px] leading-[1.4] text-[#86868B] max-w-[600px] mx-auto">
            Keep your team aligned with a clean, focused workspace designed for
            clarity and speed
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-base h-12 px-8 gap-2">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16 max-w-[980px]">
        <div className="grid gap-8">
          {/* Feature 1 */}
          <div className="flex items-start gap-6 p-8 rounded-2xl border bg-background">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1D1D1F] flex items-center justify-center">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[24px] font-semibold tracking-tight text-[#1D1D1F]">
                Visual project boards
              </h3>
              <p className="text-[17px] leading-[1.5] text-[#86868B]">
                Organize work with intuitive kanban boards. Move tasks through
                stages and track progress at a glance
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-6 p-8 rounded-2xl border bg-background">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1D1D1F] flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[24px] font-semibold tracking-tight text-[#1D1D1F]">
                Team collaboration
              </h3>
              <p className="text-[17px] leading-[1.5] text-[#86868B]">
                Invite team members, assign tasks, and keep everyone on the same
                page with real-time updates
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-6 p-8 rounded-2xl border bg-background">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1D1D1F] flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[24px] font-semibold tracking-tight text-[#1D1D1F]">
                Built for speed
              </h3>
              <p className="text-[17px] leading-[1.5] text-[#86868B]">
                Fast, responsive interface that keeps up with your workflow.
                No lag, no friction, just work
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-6 p-8 rounded-2xl border bg-background">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1D1D1F] flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[24px] font-semibold tracking-tight text-[#1D1D1F]">
                Secure by design
              </h3>
              <p className="text-[17px] leading-[1.5] text-[#86868B]">
                Your data is protected with enterprise-grade security.
                Focus on your work, not on worry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="container mx-auto px-6 py-16 max-w-[980px]">
        <div className="rounded-2xl border bg-background p-12">
          <h2 className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] mb-8 text-center">
            Everything you need
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 max-w-[600px] mx-auto">
            {[
              "Unlimited projects",
              "Kanban boards",
              "Team collaboration",
              "Task assignments",
              "Custom statuses",
              "Due dates & tracking",
              "Comments & threads",
              "Real-time updates",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#1D1D1F] flex-shrink-0" />
                <span className="text-[17px] text-[#1D1D1F]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 max-w-[980px]">
        <div className="text-center space-y-6">
          <h2 className="text-[48px] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1D1D1F]">
            Start building today
          </h2>
          <p className="text-[19px] text-[#86868B]">
            No credit card required. Get started in seconds
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-base h-12 px-8 gap-2">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-6 py-8 max-w-[980px]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#86868B]">© 2024 PM. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link
                href="/signin"
                className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
