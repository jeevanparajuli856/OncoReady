import React from 'react';
import { Car, Clock3, Construction } from 'lucide-react';

export const TransportationWorkspace: React.FC = () => (
  <div className="page-shell min-h-[70vh] flex items-center justify-center py-10">
    <section className="card-sticker w-full max-w-2xl p-8 sm:p-12 text-center space-y-5">
      <span className="mx-auto w-16 h-16 rounded-2xl bg-sun/30 text-ink flex items-center justify-center">
        <Car className="w-8 h-8" aria-hidden="true" />
      </span>
      <div>
        <p className="label-caps text-muted-fg">CareLink Transportation Workspace</p>
        <h1 className="font-display text-3xl font-extrabold mt-2">Transportation operations are coming next.</h1>
        <p className="text-muted-fg mt-3 max-w-lg mx-auto leading-relaxed">
          This workspace is reserved for transportation managers and vendor partners. CareLink dispatch tools, vendor queues, and trip operations will be added in a future sprint.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 chip chip-sun">
        <Clock3 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Workspace reserved</span>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-fg">
        <Construction className="w-4 h-4" aria-hidden="true" />
        <span>No dispatch actions are enabled in this view.</span>
      </div>
    </section>
  </div>
);
