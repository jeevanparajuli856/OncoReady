import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useRef, useState } from 'react';

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
};

export const FloatingDock = ({
  items,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return <FloatingDockMobile items={items} className={mobileClassName} />;
};

const DockTarget = ({
  href,
  onClick,
  children,
  className,
  ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}) => {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className={className}>
        {children}
      </button>
    );
  }
  return (
    <a href={href || '#'} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  return (
    <nav
      aria-label="Workspace dock"
      className={cn(
        'flex w-full max-w-[22rem] md:hidden items-center justify-between gap-1 rounded-2xl border border-white/80 bg-white/75 px-1.5 py-1.5 shadow-glass backdrop-blur-xl',
        className,
      )}
    >
      {items.map((item) => (
        <DockTarget
          key={item.title}
          href={item.href}
          onClick={item.onClick}
          ariaLabel={item.title}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            item.active ? 'bg-accent text-white' : 'bg-white/80 text-ink',
          )}
        >
          <div className="h-4 w-4">{item.icon}</div>
        </DockTarget>
      ))}
    </nav>
  );
};

export const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.nav
      aria-label="Workspace dock"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto hidden h-16 items-end gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 pb-3 shadow-glass backdrop-blur-xl md:flex',
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.nav>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
  active,
}: {
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 72, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 72, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 36, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 36, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <DockTarget href={href} onClick={onClick} ariaLabel={title} className="outline-none">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative flex aspect-square items-center justify-center rounded-xl',
          active ? 'bg-accent text-white' : 'bg-white/90 text-ink',
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 2, x: '-50%' }}
              className="absolute -top-9 left-1/2 w-fit rounded-lg bg-ink px-2.5 py-0.5 text-xs font-heading font-medium whitespace-nowrap text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </DockTarget>
  );
}
