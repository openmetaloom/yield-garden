import type { Metadata } from 'next';
import ConsolidatedView from '@/components/ConsolidatedView';

export const metadata: Metadata = {
  title: 'Both Views - yield.garden',
  description: 'Side-by-side Farm and Garden agent views',
};

export default function BothPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">👁️</span>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--farm-teal)] to-[var(--garden-cyan)] bg-clip-text text-transparent">
                Side-by-Side View
              </h1>
              <p className="text-gray-400 mt-1">
                Compare Farm and Garden agents in real-time
              </p>
            </div>
          </div>
        </header>

        <ConsolidatedView />
      </div>
    </main>
  );
}
