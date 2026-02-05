import { getRecentIncidents } from '@/lib/incidents';
import IncidentFeed from '@/components/IncidentFeed';
import Link from 'next/link';

export default async function IncidentsPage() {
  const incidents = await getRecentIncidents(50);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="border-b" style={{ background: '#0d0d0d', borderColor: '#1a1a1a' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ffd60a' }}>
                <span className="text-black font-bold text-lg">TB</span>
              </div>
              <div>
                <h1 className="font-semibold text-white text-lg">
                  Token<span style={{ color: '#ffd60a' }}>Bot</span> Status
                </h1>
                <p className="text-xs" style={{ color: '#555555' }}>Incident History</p>
              </div>
            </Link>
            <Link
              href="/"
              className="text-sm transition-colors link-underline"
              style={{ color: '#ffd60a' }}
            >
              ← Back to Status
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Incident History</h2>
          <p className="mt-1" style={{ color: '#888888' }}>
            A timeline of past incidents and their resolutions.
          </p>
        </div>

        <IncidentFeed incidents={incidents} showAll />

        {incidents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No incidents on record
            </h3>
            <p style={{ color: '#888888' }}>
              TokenBot has been running smoothly with no reported incidents.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: '#1f1f1f' }}>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm" style={{ color: '#555555' }}>
          <p>
            <a href="https://tokenbot.com" className="transition-colors hover:text-[#ffd60a]" style={{ color: '#888888' }}>TokenBot</a>
            {' • '}
            <a href="https://docs.tokenbot.com" className="transition-colors hover:text-[#ffd60a]" style={{ color: '#888888' }}>Documentation</a>
            {' • '}
            <a href="https://twitter.com/tokenbot" className="transition-colors hover:text-[#ffd60a]" style={{ color: '#888888' }}>Twitter</a>
          </p>
          <p className="mt-3 text-xs" style={{ color: '#555555' }}>
            Powered by <span style={{ color: '#ffd60a' }}>TokenBot</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
