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
  const iconClass = 'h-full w-full';
  const items = [
    {
      title: 'Home',
      icon: <IconHome className={iconClass} />,
      onClick: () => onSelectPerspective('LANDING'),
      active: currentPerspective === 'LANDING',
    },
    {
      title: 'Patient',
      icon: <IconHeart className={iconClass} />,
      onClick: () => onSelectPerspective('PATIENT'),
      active: currentPerspective === 'PATIENT',
    },
    {
      title: 'Staff',
      icon: <IconStethoscope className={iconClass} />,
      onClick: () => onSelectPerspective('STAFF'),
      active: currentPerspective === 'STAFF',
    },
    {
      title: 'Caregiver',
      icon: <IconUsers className={iconClass} />,
      onClick: () => onSelectPerspective('CAREGIVER'),
      active: currentPerspective === 'CAREGIVER',
    },
    {
      title: 'Graph',
      icon: <IconChartDots3 className={iconClass} />,
      onClick: () => onSelectPerspective('SYSTEM'),
      active: currentPerspective === 'SYSTEM',
    },
    {
      title: 'Enter workspace',
      icon: <IconLogin2 className={iconClass} />,
      onClick: onOpenAuthModal,
      active: currentPerspective === 'SIGN_IN',
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto max-w-full overflow-x-auto">
        <FloatingDock items={items} />
      </div>
    </div>
  );
};
