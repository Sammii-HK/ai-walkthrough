import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">AI Walkthrough</h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered product video automation. Create marketing videos from your workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/record"
            className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Record Workflow</h2>
            <p className="text-gray-600">
              Capture a new workflow using browser automation or screen recording
            </p>
          </Link>

          <Link
            href="/projects"
            className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Projects</h2>
            <p className="text-gray-600">
              View and manage your video projects
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Record your workflow using browser automation or screen recording</li>
            <li>AI analyzes the workflow and generates a marketing script</li>
            <li>Voiceover is automatically created using AI text-to-speech</li>
            <li>Text overlays are added and synchronized with the video</li>
            <li>Export your final marketing video</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
