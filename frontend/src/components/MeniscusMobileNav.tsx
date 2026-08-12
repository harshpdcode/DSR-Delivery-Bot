"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, PanInfo } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface MobileNavItem {
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
}

interface MeniscusMobileNavProps {
  items: MobileNavItem[];
  hasUnread?: boolean;
}

export default function MeniscusMobileNav({ items, hasUnread = false }: MeniscusMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = items.findIndex((item) => item.href === pathname);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // Handle Drag End to snap to adjacent tabs
  const handleDragEnd = (_: any, info: PanInfo) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    // Threshold to trigger tab change
    if (offsetX < -35 || velocityX < -200) {
      // Dragged Left -> Next Tab
      if (safeActiveIndex < items.length - 1) {
        router.push(items[safeActiveIndex + 1].href);
      }
    } else if (offsetX > 35 || velocityX > 200) {
      // Dragged Right -> Previous Tab
      if (safeActiveIndex > 0) {
        router.push(items[safeActiveIndex - 1].href);
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-[9999] select-none pointer-events-auto">
      {/* Floating Meniscus Glass Dock Bar */}
      <div
        ref={containerRef}
        className="relative rounded-2xl bg-surface-1/95 border border-surface-3/80 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.7)] px-2 py-2 flex items-center justify-around overflow-visible"
      >
        {items.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 py-1 group cursor-pointer"
            >
              {/* Active Tab: Draggable Floating Bead & Label */}
              {isActive ? (
                <div className="relative flex flex-col items-center">
                  {/* Interactive Draggable Floating Bead Pill */}
                  <motion.div
                    layoutId="meniscus-bead"
                    drag="x"
                    dragConstraints={{ left: -100, right: 100 }}
                    dragElastic={0.2}
                    dragSnapToOrigin={true}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 1.2, cursor: "grabbing" }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    className="w-11 h-11 rounded-full bg-brand-lime text-brand-black flex items-center justify-center shadow-[0_0_22px_rgba(132,224,0,0.6)] -mt-6 mb-0.5 z-20 cursor-grab touch-none"
                    title="Tap or drag along the bar to switch tabs"
                  >
                    <Icon className="h-5 w-5 stroke-[2.5] pointer-events-none" />
                    {item.href === "/dashboard/notifications" && hasUnread && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-brand-black ring-2 ring-brand-lime pointer-events-none" />
                    )}
                  </motion.div>

                  {/* Active Label in Brand Lime */}
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-micro font-black text-brand-lime tracking-tight truncate max-w-[68px]"
                  >
                    {item.shortName}
                  </motion.span>
                </div>
              ) : (
                /* Inactive Tab: Icon & Dimmed Label */
                <div className="flex flex-col items-center justify-center py-1 transition-opacity duration-200 opacity-60 hover:opacity-100">
                  <div className="relative">
                    <Icon className="h-5 w-5 text-brand-white" />
                    {item.href === "/dashboard/notifications" && hasUnread && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-lime ring-1 ring-surface-1" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-brand-white/70 mt-1 tracking-tight truncate max-w-[64px]">
                    {item.shortName}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
