import React from 'react';
import { Car, CheckCircle2, Construction, PlugZap } from 'lucide-react';

export const TransportationWorkspace: React.FC = () => (
  <div className="page-shell min-h-[70vh] flex items-center justify-center py-10">
    <section className="card-sticker w-full max-w-2xl p-8 sm:p-12 text-center space-y-5">
      <span className="mx-auto w-16 h-16 rounded-2xl bg-sun/30 text-ink flex items-center justify-center">
        <Car className="w-8 h-8" aria-hidden="true" />
      </span>
      <div>
        <p className="label-caps text-muted-fg">Transportation provider adapters</p>
        <h1 className="font-display text-3xl font-extrabold mt-2">A clear path from coordination to dispatch.</h1>
        <p className="text-muted-fg mt-3 max-w-lg mx-auto leading-relaxed">
          The recorded journey uses local synthetic CareLink events. Additional providers can fit the same bounded adapter model without changing the patient plan workflow.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-left">
        <article className="metric-tile space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading font-bold">CareLink</h2>
            <CheckCircle2 className="w-4 h-4 text-mint" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold">Synthetic scenario provider</p>
          <p className="text-xs text-muted-fg">Playable local recovery and previous-trip replay. No live provider connection.</p>
        </article>
        <article className="metric-tile space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading font-bold">Uber Health</h2>
            <PlugZap className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold">Integration-ready preview · not connected</p>
          <p className="text-xs text-muted-fg">Adapter label only. No booking, contract, API call, or Uber dispatch success is represented.</p>
        </article>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-fg">
        <Construction className="w-4 h-4" aria-hidden="true" />
        <span>No dispatch actions are enabled in this view.</span>
      </div>
    </section>
  </div>
);
