import Container from "@/components/Container";

export default function Loading() {
  return (
    <Container className="pt-28 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3 w-full animate-pulse">
            <div className="aspect-square w-full rounded-2xl bg-neutral-200"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/5"></div>
            </div>
            <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/3 mt-1"></div>
          </div>
        ))}
      </div>
    </Container>
  );
}
