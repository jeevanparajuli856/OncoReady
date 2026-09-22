import React from 'react';
import {
  IconHome,
  IconStethoscope,
  IconUsers,
  IconHeart,
  IconChartDots3,
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
  const isPublic = currentPerspective === 'LANDING' || currentPerspective === 'SIGN_IN';
  const openOrSelect = (perspective: Perspective) => {
    if (isPublic && perspective !== 'LANDING') {
      onOpenAuthModal();
      return;
    }
    onSelectPerspective(perspective);
  };
  const items = [
    {
      title: 'Home',
      icon: <IconHome className={iconClass} />,
      onClick: () => openOrSelect('LANDING'),
      active: currentPerspective === 'LANDING' || currentPerspective === 'SIGN_IN',
    },
    {
      title: 'Patient',
      icon: <IconHeart className={iconClass} />,
      onClick: () => openOrSelect('PATIENT'),
      active: currentPerspective === 'PATIENT',
    },
    {
      title: 'Staff',
      icon: <IconStethoscope className={iconClass} />,
      onClick: () => openOrSelect('STAFF'),
      active: currentPerspective === 'STAFF',
    },
    {
      title: 'Caregiver',
      icon: <IconUsers className={iconClass} />,
      onClick: () => openOrSelect('CAREGIVER'),
      active: currentPerspective === 'CAREGIVER',
    },
    {
      title: 'Graph',
      icon: <IconChartDots3 className={iconClass} />,
      onClick: () => openOrSelect('SYSTEM'),
      active: currentPerspective === 'SYSTEM',
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-[60] flex justify-center px-3 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="pointer-events-auto w-full max-w-[22rem]">
        <FloatingDock items={items} />
      </div>
    </div>
  );
};
