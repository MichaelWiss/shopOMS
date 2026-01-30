import Link from 'next/link'
import { ShoppingBag, Package, ArrowRight, Zap, RefreshCw, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="font-semibold text-lg">shopOMS</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition">
              Products
            </Link>
            <Link href="/cart" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition">
              <ShoppingBag className="h-5 w-5" />
              <span>Cart</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Headless Commerce with Real-World Integration
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A production-ready architecture connecting Shopify storefront to Odoo ERP 
            through a custom middleware layer.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/admin"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-12">Architecture Highlights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border border-border">
              <Zap className="h-10 w-10 mb-4 text-yellow-500" />
              <h3 className="font-semibold text-lg mb-2">Real-time Webhooks</h3>
              <p className="text-muted-foreground">
                Shopify webhooks trigger instant syncs to Odoo with signature verification and retry logic.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
              <RefreshCw className="h-10 w-10 mb-4 text-blue-500" />
              <h3 className="font-semibold text-lg mb-2">Queue-Based Processing</h3>
              <p className="text-muted-foreground">
                BullMQ handles async processing with exponential backoff and dead letter queues.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
              <BarChart3 className="h-10 w-10 mb-4 text-green-500" />
              <h3 className="font-semibold text-lg mb-2">Full Observability</h3>
              <p className="text-muted-foreground">
                Every sync event logged to Supabase for debugging, analytics, and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Tech Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['Next.js 15', 'Shopify API', 'Odoo ERP', 'Supabase', 'BullMQ', 'Redis', 'TypeScript', 'Tailwind'].map((tech) => (
              <div key={tech} className="py-3 px-4 bg-muted rounded-lg text-sm font-medium">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>shopOMS - A middleware-first approach to headless commerce</p>
        </div>
      </footer>
    </div>
  )
}
