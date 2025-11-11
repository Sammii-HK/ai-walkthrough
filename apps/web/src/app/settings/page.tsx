'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [aiProvider, setAIProvider] = useState<'openai' | 'anthropic'>('openai');
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [ttsProvider, setTTSProvider] = useState<'openai' | 'elevenlabs'>('openai');

  const handleSave = () => {
    // TODO: Save settings to localStorage or backend
    alert('Settings saved!');
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">Settings</h1>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Provider</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">
                  <input
                    type="radio"
                    value="openai"
                    checked={aiProvider === 'openai'}
                    onChange={(e) => setAIProvider(e.target.value as 'openai')}
                    className="mr-2"
                  />
                  OpenAI
                </label>
              </div>
              <div>
                <label className="block mb-2">
                  <input
                    type="radio"
                    value="anthropic"
                    checked={aiProvider === 'anthropic'}
                    onChange={(e) => setAIProvider(e.target.value as 'anthropic')}
                    className="mr-2"
                  />
                  Anthropic Claude
                </label>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API Keys</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">OpenAI API Key</label>
                <input
                  type="password"
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Anthropic API Key</label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="sk-ant-..."
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Text-to-Speech Provider</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">
                  <input
                    type="radio"
                    value="openai"
                    checked={ttsProvider === 'openai'}
                    onChange={(e) => setTTSProvider(e.target.value as 'openai')}
                    className="mr-2"
                  />
                  OpenAI TTS
                </label>
              </div>
              <div>
                <label className="block mb-2">
                  <input
                    type="radio"
                    value="elevenlabs"
                    checked={ttsProvider === 'elevenlabs'}
                    onChange={(e) => setTTSProvider(e.target.value as 'elevenlabs')}
                    className="mr-2"
                  />
                  ElevenLabs
                </label>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

