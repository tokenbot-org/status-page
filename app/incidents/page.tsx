import { getRecentIncidents } from '@/lib/incidents';
import IncidentFeed from '@/components/IncidentFeed';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function IncidentsPage() {
  const incidents = await getRecentIncidents(50);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TB</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 dark:text-white">TokenBot Status</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Incident History</p>
                </div>
              </Link>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Status
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incident History</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            A timeline of past incidents and their resolutions.
          </p>
        </div>

        <IncidentFeed incidents={incidents} showAll />

        {incidents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No incidents on record
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              TokenBot has been running smoothly with no reported incidents.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            <a href="https://tokenbot.com" className="hover:underline">TokenBot</a>
            {' • '}
            <a href="https://docs.tokenbot.com" className="hover:underline">Documentation</a>
            {' • '}
            <a href="https://twitter.com/tokenbot" className="hover:underline">Twitter</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
