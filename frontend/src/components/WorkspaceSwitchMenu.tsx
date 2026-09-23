import React from 'react';
import { Home } from 'lucide-react';
import { Avatar } from './Avatar';
import { PRIMARY_PROVIDER } from '../state/workflowState';
import type { Perspective } from '../types';

interface WorkspaceSwitchMenuProps {
  currentPerspective: Perspective;
  patientAvatarUrl: string;
  caregiverAvatarUrl: string;
  onSelect: (perspective: Perspective) => void;
}

/** Workspace list shared by the OncoReady header and the CareLink bar, so demo switching works from both. */
export const WorkspaceSwitchMenu: React.FC<WorkspaceSwitchMenuProps> = ({ currentPerspective, patientAvatarUrl, caregiverAvatarUrl, onSelect }) => (
  <>
    <div className="px-3.5 py-2 border-b border-line">
      <div className="text-[11px] font-heading font-semibold uppercase tracking-wider text-muted-fg">
        SWITCH WORKSPACE
      </div>
    </div>
    <div className="py-1">
      <button onClick={() => onSelect('PATIENT')} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-muted ${currentPerspective === 'PATIENT' ? 'bg-accent/8 font-semibold' : ''}`}>
        <Avatar src={patientAvatarUrl} alt="Camila" size="xs" roleType="PATIENT" />
        <div>
          <div>Patient Portal (Camila Lopez)</div>
          <div className="text-[10px] text-muted-fg font-normal">Patient Readiness View</div>
        </div>
      </button>
      <button onClick={() => onSelect('CARE_NAVIGATOR')} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-mint/8 ${currentPerspective === 'CARE_NAVIGATOR' ? 'bg-mint/10 font-semibold' : ''}`}>
        <Avatar alt="Marcus Vance" size="xs" roleType="NAVIGATOR" />
        <div>
          <div>Care Navigator (Marcus Vance, MSW)</div>
          <div className="text-[10px] text-muted-fg font-normal">Transportation & Patient Coordination</div>
        </div>
      </button>
      <button onClick={() => onSelect('CARE_TEAM')} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-muted ${currentPerspective === 'CARE_TEAM' ? 'bg-accent/8 font-semibold' : ''}`}>
        <Avatar alt="Nurse Sarah" size="xs" roleType="NURSE" />
        <div>
          <div>Care Team (Readiness Team)</div>
          <div className="text-[10px] text-muted-fg font-normal">Clinical & Treatment Readiness</div>
        </div>
      </button>
      <button onClick={() => onSelect('CARELINK_VENDOR')} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-mint/8 ${currentPerspective === 'CARELINK_VENDOR' ? 'bg-mint/10 font-semibold' : ''}`}>
        <img src="/carelink-mark.svg" alt="" width={24} height={24} className="shrink-0 rounded-md" />
        <div>
          <div>CareLink by OncoReady ({PRIMARY_PROVIDER})</div>
          <div className="text-[10px] text-muted-fg font-normal">Trip Offers & Status Only</div>
        </div>
      </button>
      <button onClick={() => onSelect('CAREGIVER')} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-mint/8 ${currentPerspective === 'CAREGIVER' ? 'bg-mint/10 font-semibold' : ''}`}>
        <Avatar src={caregiverAvatarUrl} alt="Ana" size="xs" roleType="CAREGIVER" />
        <div>
          <div>Caregiver Portal (Ana Hernandez)</div>
          <div className="text-[10px] text-muted-fg font-normal">Transit Status Only</div>
        </div>
      </button>
    </div>
    <div className="pt-1 mt-1 border-t border-line">
      <button onClick={() => onSelect('LANDING')} className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-heading font-semibold text-accent hover:bg-accent/8">
        <Home className="w-3.5 h-3.5" />
        <span>Return to Product Website</span>
      </button>
    </div>
  </>
);
