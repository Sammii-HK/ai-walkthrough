'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMethod, setRecordingMethod] = useState<'browser' | 'screen' | null>(null);

  const handleStartRecording = (method: 'browser' | 'screen') => {
    setRecordingMethod(method);
    setIsRecording(true);
    // TODO: Implement recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implement stop and save logic
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">Record Workflow</h1>

        {!isRecording ? (
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Browser Automation</h2>
              <p className="text-gray-600 mb-4">
                Automatically navigate through your website or app using Playwright.
                Enter a URL and define the workflow steps.
              </p>
              <button
                onClick={() => handleStartRecording('browser')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start Browser Recording
              </button>
            </div>

            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Screen Recording</h2>
              <p className="text-gray-600 mb-4">
                Record your screen while manually navigating through your app.
                Perfect for complex workflows or when you want full control.
              </p>
              <button
                onClick={() => handleStartRecording('screen')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Screen Recording
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Recording {recordingMethod === 'browser' ? 'Browser Automation' : 'Screen'}
            </h2>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
            <button
              onClick={handleStopRecording}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Stop Recording
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

