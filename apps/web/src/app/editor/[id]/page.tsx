import Link from 'next/link';

export default function EditorPage({ params }: { params: { id: string } }) {
  // TODO: Fetch project data
  const projectId = params.id;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/projects" className="text-blue-600 hover:underline">
            ← Back to Projects
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">Video Editor</h1>
        <p className="text-gray-600 mb-6">Project ID: {projectId}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6 bg-gray-100 aspect-video flex items-center justify-center">
              <p className="text-gray-500">Video Preview</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Script</h2>
              <p className="text-sm text-gray-600">Edit narration script</p>
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Edit Script
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Text Overlays</h2>
              <p className="text-sm text-gray-600">Adjust overlay positions and timing</p>
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Edit Overlays
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Style</h2>
              <p className="text-sm text-gray-600">Customize colors, fonts, transitions</p>
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Edit Style
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Export Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

