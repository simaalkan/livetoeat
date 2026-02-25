import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Star, ChevronLeft, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RestaurantDetailsClient } from './restaurant-details-client';

export const runtime = 'nodejs';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: Number(id) },
    include: {
      images: { orderBy: { order: 'asc' } },
      categories: true,
    },
  });

  if (!restaurant) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 min-h-screen font-sans">
      {/* Top Navigation */}
      <div className="mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Back to List
        </Link>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase">
            {restaurant.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={`${
                    star <= (restaurant.rating || 0) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 font-bold text-yellow-700">
                {restaurant.rating ? restaurant.rating.toFixed(1) : "0.0"}
              </span>
            </div>

            <div className="flex items-center text-muted-foreground text-sm font-medium">
              <Calendar size={16} className="mr-2" />
              Added on {new Date(restaurant.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="mb-16">
        <RestaurantDetailsClient images={restaurant.images} />
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Notes */}
        <div className="lg:col-span-8 space-y-10">
          <section className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-primary/20 rounded-full" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Personal Notes
            </h2>
            {restaurant.note ? (
              <div className="bg-muted/30 p-8 rounded-3xl border border-muted shadow-inner">
                <p className="text-xl text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium italic">
                  &quot;{restaurant.note}&quot;
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic bg-muted/20 p-6 rounded-2xl border border-dashed text-center">
                No notes have been left for this place yet.
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Categories */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-card border-2 border-primary/5 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <Tag size={18} className="text-primary" /> Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {restaurant.categories.length > 0 ? (
                restaurant.categories.map((cat) => (
                  <Badge 
                    key={cat.id} 
                    variant="secondary" 
                    className="px-4 py-1.5 text-xs font-bold rounded-xl border-none bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    #{cat.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No categories specified.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}