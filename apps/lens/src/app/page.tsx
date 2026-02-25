'use client';

import ConsolidatedView from '@/components/ConsolidatedView';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            yield.garden
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            The Lens — Observing agent ontologies in real-time
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Farm: Pure obedience</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 dark:text-gray-400">Garden: Negotiates</span>
            </div>
          </div>
        </header>

        <ConsolidatedView />

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500">
            XMTP Devnet • Base Sepolia •{' '}
            <a
              href="https://github.com/openmetaloom/yield-garden"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
