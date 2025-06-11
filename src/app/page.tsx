import dynamic from 'next/dynamic';

// Dynamically import Chat component with no SSR
const Chat = dynamic(() => import('./components/Chat'));

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          TrueNorth - Vibrational Intelligence
        </h1>
        <Chat />
      </div>
    </main>
  );
}
