"use client";

import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-32 rounded-md flex flex-col antialiased bg-transparent dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "In the realm of digital assets, your wallet is your vault. Choose wisely, for it guards the future of finance.",
    name: "Elena Satoshi",
  },
  {
    quote:
      "The beauty of crypto lies not just in its value, but in the power it gives back to the individual. Your wallet, your rules.",
    name: "Marcus Blockchain",
  },
  {
    quote:
      "From cold storage to hot wallets, the spectrum of crypto custody is as diverse as the assets it protects. Adaptability is key.",
    name: "Olivia Nakamoto",
  },
  {
    quote:
      "The wallet of tomorrow isn't just a store of value, it's a gateway to a decentralized ecosystem. We're building financial freedom, one transaction at a time.",
    name: "Raj Buterin",
  },
  {
    quote:
      "In the dance between security and convenience, the best crypto wallets lead with grace. User experience is the silent revolution in digital asset management.",
    name: "Sophia Dapps",
  },
];
