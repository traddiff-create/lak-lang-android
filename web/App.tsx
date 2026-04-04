import { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FlashcardDeck } from './components/flashcards';
import { PronunciationGuide } from './components/pronunciation';
import { Cultural } from './components/cultural';
import { Quiz } from './components/quiz';
import { Conversation } from './components/conversation';
import { Reviewer } from './components/reviewer';
import { GraphExplorer } from './components/graph-explorer';
import { StoriesList, StoryView } from './components/story-view';
import { CouncilFireEntry, LearningLoop } from './components/council-fire';
import { MuseumEntry } from './components/museum';
import { type Season } from './hooks/useSeasonalContent';

// Council Fire — immersive entry point
function CouncilFireRouter() {
  const [season, setSeason] = useState<Season | null>(null);

  if (!season) {
    return <CouncilFireEntry onSeasonSelect={setSeason} />;
  }

  return <LearningLoop season={season} onExit={() => setSeason(null)} />;
}

// Layout wrapper — shows Nav only for traditional routes
function AppLayout() {
  const { pathname } = useLocation();
  const isCouncilFire = pathname === '/' || pathname.startsWith('/council-fire');
  const isMuseum = pathname === '/museum';

  if (isMuseum) {
    return (
      <Routes>
        <Route path="/museum" element={<MuseumEntry />} />
      </Routes>
    );
  }

  if (isCouncilFire) {
    return (
      <Routes>
        <Route path="/" element={<CouncilFireRouter />} />
        <Route path="/council-fire" element={<CouncilFireRouter />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Nav />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route path="/traditional" element={<TraditionalHome />} />
          <Route path="/flashcards" element={<FlashcardDeck />} />
          <Route path="/pronunciation" element={<PronunciationGuide />} />
          <Route path="/culture" element={<Cultural />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/stories" element={<StoriesList />} />
          <Route path="/stories/:id" element={<StoryView />} />
          <Route path="/graph" element={<GraphExplorer />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/reviewer" element={<Reviewer />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        Made with the Lakota community
      </footer>
    </div>
  );
}

function Nav() {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Council Fire' },
    { to: '/museum', label: 'Museum' },
    { to: '/flashcards', label: 'Flashcards' },
    { to: '/pronunciation', label: 'Pronunciation' },
    { to: '/culture', label: 'Culture' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/stories', label: 'Stories' },
    { to: '/graph', label: 'Explore' },
    { to: '/conversation', label: 'Practice' },
    { to: '/reviewer', label: 'Review' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/traditional" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
          Lakota Language Learning
        </Link>
        <nav className="flex gap-1 flex-wrap">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

// Traditional home — the old module grid (now at /traditional)
const modules = [
  { to: '/museum', icon: '🌌', label: 'Living Museum', description: 'Explore Lakota culture in an interactive cosmos — seven sacred directions.' },
  { to: '/stories', icon: '📜', label: 'Stories', description: 'Learn through Lakota stories and oral traditions.' },
  { to: '/graph', icon: '🕸️', label: 'Knowledge Graph', description: 'Explore how words, stories, values, and places connect.' },
  { to: '/flashcards', icon: '🃏', label: 'Flashcards', description: 'Build vocabulary with community-verified word cards.' },
  { to: '/pronunciation', icon: '🔤', label: 'Pronunciation', description: 'Learn LLC orthography — vowels, consonants, and diacritics.' },
  { to: '/culture', icon: '📖', label: 'Cultural Context', description: 'Short articles about Lakota culture and tradition.' },
  { to: '/quiz', icon: '✏️', label: 'Quiz', description: 'Test your knowledge with multiple choice and fill-in-the-blank.' },
  { to: '/conversation', icon: '💬', label: 'Conversation Practice', description: 'Practice with an AI tutor using only approved vocabulary.' },
];

function TraditionalHome() {
  return (
    <div>
      <div className="text-center py-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-3">
          Lakota Language Learning
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          A community-verified platform for learning the Lakota language.
          All content reviewed by Lakota community partners.
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <Link to="/" className="text-sm text-purple-600 hover:text-purple-800">
            Council Fire
          </Link>
          <Link to="/museum" className="text-sm text-amber-700 hover:text-amber-900">
            Living Museum
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {modules.map(m => (
          <Link
            key={m.to}
            to={m.to}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="text-3xl mb-3">{m.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700">{m.label}</h3>
            <p className="text-sm text-gray-500">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default App;
