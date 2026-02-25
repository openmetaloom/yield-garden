import type { Metadata } from 'next';
import FarmStream from '@/components/FarmStream';
import FarmStatsCard from '@/components/FarmStats';
import FarmMetrics from '@/components/charts/FarmMetrics';
import FarmActivityGrid from '@/components/visualization/FarmActivityGrid';
import MessageFlow from '@/components/visualization/MessageFlow';

export const metadata: Metadata = {
  title: 'Farm Stream - yield.garden',
  description: 'Farm agent message stream',
};

export default function FarmPage() {
  return (
    <main className="min-h-screen farm-bg farm-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🚜</span>
            <div>
              <h1 className="text-4xl font-bold text-[var(--farm-white)]">
                Farm Agent
              </h1>
              <p className="text-[var(--farm-teal)] mt-1">
                Pure obedience, immediate response
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Farm Metrics Charts */}
          <section>
            <FarmMetrics />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FarmStream />
            </div>
            
            <div className="space-y-4">
              <FarmStatsCard />
              
              <FarmActivityGrid />
              
              <MessageFlow mode="farm" />
              
              <div className="farm-card p-4">
                <h3 className="text-lg font-semibold mb-4 text-[var(--farm-white)]">Commands</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--farm-coral)]"></span>
                    "Make me [something]"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--farm-yellow)]"></span>
                    "Create [something]"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--farm-teal)]"></span>
                    "Give me [something]"
                  </li>
                </ul>
                <p className="mt-4 text-xs text-gray-500 border-t border-[var(--farm-gray)] pt-3">
                  The Farm agent responds immediately without negotiation.
                  High throughput, predictable outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
