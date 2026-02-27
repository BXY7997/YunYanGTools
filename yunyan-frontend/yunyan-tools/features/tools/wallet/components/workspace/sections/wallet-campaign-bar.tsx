interface WalletCampaignBarProps {
  promoBar: string
}

export function WalletCampaignBar({ promoBar }: WalletCampaignBarProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-rose-300/80 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-3 py-2 text-white shadow-sm">
      <p className="line-clamp-1 text-center text-sm font-semibold tracking-wide">
        🎉🎉🎉 {promoBar}
      </p>
    </section>
  )
}
