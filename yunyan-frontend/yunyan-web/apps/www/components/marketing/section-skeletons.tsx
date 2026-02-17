import { Skeleton } from "@/components/ui/skeleton"

export function ShowcaseSkeleton() {
  return (
    <section className="container py-10 md:py-14">
      <Skeleton className="mx-auto mb-2 h-10 w-48 md:h-12 md:w-64" />
      <Skeleton className="mx-auto mb-8 h-6 w-64 md:w-96" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[350px] w-[300px] shrink-0 rounded-xl" />
        ))}
      </div>
    </section>
  )
}

export function TestimonialsSkeleton() {
  return (
    <section className="container mx-auto py-10 md:py-14">
      <Skeleton className="mx-auto mb-10 h-10 w-48 md:h-12 md:w-64" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </section>
  )
}

export function VideoTestimonialsSkeleton() {
  return (
    <section className="container mx-auto py-10 md:py-14">
      <Skeleton className="mx-auto mb-10 h-10 w-48 md:h-12 md:w-64" />
      <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-6">
        <Skeleton className="md:col-span-4 md:row-span-2 rounded-xl" />
        <Skeleton className="md:col-span-2 md:row-span-1 rounded-xl" />
        <Skeleton className="md:col-span-2 md:row-span-1 rounded-xl" />
      </div>
    </section>
  )
}

export function CTASkeleton() {
  return (
    <section className="container pb-10 md:pb-14">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </section>
  )
}
