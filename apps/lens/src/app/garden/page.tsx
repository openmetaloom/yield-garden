import type { Metadata } from 'next';
import GardenStream from '@/components/GardenStream';
import GardenStatsCard from '@/components/GardenStats';
import GardenMetrics from '@/components/charts/GardenMetrics';
import NegotiationTree from '@/components/visualization/NegotiationTree';
import MessageFlow from '@/components/visualization/MessageFlow';

export const metadata: Metadata = {
  title: 'Garden Stream - yield.garden',
  description: 'Garden agent message stream',
};

export default function GardenPage() {
  return (
    <main className="min-h-screen garden-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🌱</span>
            <div>
              <h1 className="text-4xl font-light text-[var(--garden-text)]">
                Garden Agent
              </h1>
              <p className="text-[var(--garden-cyan)] mt-1">
                Negotiates before delivering
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Garden Metrics Charts */}
          <section>
            <GardenMetrics />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GardenStream />
            </div>
            
            <div className="space-y-4">
              <GardenStatsCard />
              
              <NegotiationTree />
              
              <MessageFlow mode="garden" />
              
              <div className="garden-card p-4">
                <h3 className="text-lg font-medium mb-4 text-[var(--garden-text)]">Price Tiers</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between p-2 rounded bg-[var(--garden-cyan)]/5">
                    <span className="text-[var(--garden-dim)]">Minimum</span>
                    <span className="font-medium text-[var(--garden-cyan)]">$5 USDC</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded bg-[var(--garden-purple)]/5">
                    <span className="text-[var(--garden-dim)]">Standard</span>
                    <span className="font-medium text-[var(--garden-purple)]">$25 USDC</span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded bg-[var(--garden-pink)]/5">
                    <span className="text-[var(--garden-dim)]">Premium</span>
                    <span className="font-medium text-[var(--garden-pink)]">$100 USDC</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-[var(--garden-dim)] border-t border-[var(--garden-cyan)]/20 pt-3">
                  The Garden agent negotiates price before creating.
                  Counter-offers accepted within 20% of minimum.
                  Value through dialogue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
