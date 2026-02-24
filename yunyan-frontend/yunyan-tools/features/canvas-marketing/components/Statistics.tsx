export const Statistics = () => {
  interface StatsProps {
    quantity: string;
    description: string;
  }

  const stats: StatsProps[] = [
    {
      quantity: "50,000+",
      description: "活跃团队",
    },
    {
      quantity: "120+",
      description: "合作伙伴",
    },
    {
      quantity: "99.95%",
      description: "平台可用性",
    },
    {
      quantity: "35%",
      description: "交付效率提升",
    },
  ];

  return (
    <section id="statistics">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ quantity, description }: StatsProps) => (
          <div
            key={description}
            className="home-card-surface px-4 py-3 text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{quantity}</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
