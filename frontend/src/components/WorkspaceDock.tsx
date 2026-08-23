import React from 'react';
import {
  IconHome,
  IconStethoscope,
  IconUsers,
  IconHeart,
  IconChartDots3,
  IconLogin2,
} from '@tabler/icons-react';
import { FloatingDock } from './ui/floating-dock';
import { Perspective } from '../types';

interface WorkspaceDockProps {
  currentPerspective: Perspective;
  onSelectPerspective: (p: Perspective) => void;
  onOpenAuthModal: () => void;
}

export const WorkspaceDock: React.FC<WorkspaceDockProps> = ({
  currentPerspective,
  onSelectPerspective,
  onOpenAuthModal,
}) => {
  if (currentPerspective === 'STAFF') return null;

  const iconClass = 'h-full w-full';
  const items = [
    {
      title: 'Home',
      icon: <IconHome className={iconClass} />,
      onClick: () => onSelectPerspective('LANDING'),
    },
    {
      title: 'Patient',
      icon: <IconHeart className={iconClass} />,
      onClick: () => onSelectPerspective('PATIENT'),
    },
    {
      title: 'Staff',
      icon: <IconStethoscope className={iconClass} />,
      onClick: () => onSelectPerspective('STAFF'),
    },
    {
      title: 'Caregiver',
      icon: <IconUsers className={iconClass} />,
      onClick: () => onSelectPerspective('CAREGIVER'),
    },
    {
      title: 'Graph',
      icon: <IconChartDots3 className={iconClass} />,
      onClick: () => onSelectPerspective('SYSTEM'),
    },
    {
      title: 'Enter workspace',
      icon: <IconLogin2 className={iconClass} />,
      onClick: onOpenAuthModal,
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-end px-3 md:hidden">
      <div className="pointer-events-auto">
        <FloatingDock
          items={items}
          desktopClassName="!hidden"
          mobileClassName="relative"
        />
      </div>
    </div>
  );
};
