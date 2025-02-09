import { cn } from "../../../lib/utils";
import React, { useEffect, useState } from "react";

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "50s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={item.name + idx}
            className="w-[250px] h-[110px] relative rounded-2xl flex-shrink-0 px-2 py-1 md:w-[250px] 
              bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900
              before:absolute before:inset-[10px] before:rounded-2xl before:p-[5px]
              before:bg-gradient-to-r before:from-transparent before:via-transparent before:to-transparent
              hover:before:from-red-500 hover:before:via-blue-500 hover:before:to-red-500
              before:content-[''] before:-z-10 before:transition-all before:duration-500
              after:absolute after:inset-[10px] after:rounded-2xl after:bg-zinc-900 after:-z-[5]"
          >
            <div className="relative z-10 h-full w-full rounded-2xl">
              <blockquote className="h-full flex items-center">
                <span className="text-xs leading-[1] text-gray-100 font-normal">
                  {item.quote}
                </span>
              </blockquote>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

