import Link from 'next/link';

export default function ProjectsPage() {
  // TODO: Fetch projects from API/storage
  const projects: Array<{
    id: string;
    name: string;
    url: string;
    createdAt: string;
    status: 'draft' | 'processing' | 'complete';
  }> = [];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-4">Projects</h1>

        {projects.length === 0 ? (
          <div className="p-8 border rounded-lg text-center">
            <p className="text-gray-600 mb-4">No projects yet.</p>
            <Link
              href="/record"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-6 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{project.name}</h2>
                    <p className="text-gray-600">{project.url}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        project.status === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                    <Link
                      href={`/editor/${project.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

