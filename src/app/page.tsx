import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="font-bold text-lg text-slate-800">TIL Log - Your daily learning, logged</span>
        </div>
        <a
          href="https://tambo.co"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
        >
          Powered by
          <Image
            src="/Octo-Icon.svg"
            alt="Tambo AI"
            width={20}
            height={20}
          />
          Tambo
        </a>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <span className="text-lg">🧠</span> Track your daily learnings with AI
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Today I Learned
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              Track, Reflect, Grow
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Log what you learn every day, set goals, track your streak, and get
            AI-powered insights to guide your learning journey.
          </p>

          <div className="flex items-center justify-center">
            <ApiKeyCheck>
              <a
                href="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:from-indigo-700 hover:to-blue-700 transition-all text-lg"
              >
                Start Learning
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </ApiKeyCheck>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            emoji="📝"
            title="Log Learnings"
            description="Quickly log what you learned today with auto-detected tags and source links."
          />
          <FeatureCard
            emoji="🔥"
            title="Track Streaks"
            description="Build a daily learning habit with streak tracking and activity heatmaps."
          />
          <FeatureCard
            emoji="🎯"
            title="Set Goals"
            description="Set learning goals with deadlines and track progress with related entries."
          />
          <FeatureCard
            emoji="📊"
            title="Analytics"
            description="See your learning patterns with weekly trends, topic distribution, and insights."
          />
          <FeatureCard
            emoji="💡"
            title="AI Suggestions"
            description="Get personalized recommendations on what to learn next based on your history."
          />
          <FeatureCard
            emoji="🤖"
            title="AI Chat"
            description="Talk to AI to log entries, create goals, get stats — all through natural conversation."
          />
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Chat with AI"
              description='Tell the AI what you learned today, like "I learned about React Server Components" and it logs it automatically.'
            />
            <StepCard
              step="2"
              title="Track Progress"
              description="Your dashboard shows streaks, activity charts, top topics, and goal progress — all updated in real time."
            />
            <StepCard
              step="3"
              title="Get Insights"
              description="Ask for analytics or suggestions and the AI renders rich components with your learning data."
            />
          </div>
        </div>

        {/* Tambo integration note */}
        <div className="text-center text-sm text-slate-500">
          <p>
            Built with{" "}
            <a
              href="https://tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-medium"
            >
              Tambo AI
            </a>{" "}
            — Generative UI SDK for React.
            The AI decides which components to render based on your conversation.
          </p>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-2xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
        {step}
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
