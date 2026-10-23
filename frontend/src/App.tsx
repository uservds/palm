import { useState, useRef } from 'react';

interface LockedBlock {
  title: string;
  teaser: string;
  block_type: string;
}

interface VisionResponse {
  ok: true;
  archetype: string;
  metaphor: string;
  insights: string[];
  locked_blocks: LockedBlock[];
  scientific_facts: string[];
  progress_percent: number;
  disclaimer: string;
  cta: string;
  image_quality: {
    score: number;
    issues: string[];
    user_hint: string | null;
  };
  is_fallback: boolean;
  meta: {
    provider: string;
    model: string;
    processing_time_ms: number;
    hand: string;
    confidence: number;
  };
}

type AppState = 'idle' | 'preview' | 'analyzing' | 'result' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [result, setResult] = useState<VisionResponse | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      setState('preview');

      setTimeout(() => {
        analyzeImage(file);
      }, 3000);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (file: File) => {
    setState('analyzing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://127.0.0.1:3001/api/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.ok) {
        setResult(data);
        setState('result');
      } else {
        setError(data.error?.user_message || 'Ошибка анализа');
        setState('error');
      }
    } catch (err) {
      setError('Не удалось связаться с сервером. Проверь, запущен ли backend на http://127.0.0.1:3001');
      setState('error');
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setError('');
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✋</div>
          <h1 className="text-4xl font-bold text-orange-400 mb-2">Palmis AI</h1>
          <p className="text-gray-400">Развлекательный анализ ладони</p>
        </div>

        {state === 'idle' && (
          <div className="text-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all"
            >
              📸 Сканировать ладонь
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <p className="text-gray-500 text-sm mt-4">
              Сервис носит развлекательный характер. Это не медицинская диагностика.
            </p>
          </div>
        )}

        {state === 'preview' && preview && (
          <div className="text-center">
            <div className="relative mb-6">
              <img
                src={preview}
                alt="Preview"
                className="max-h-96 rounded-xl shadow-lg mx-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-orange-500 animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-300 text-lg">Сканирование...</p>
          </div>
        )}

        {state === 'analyzing' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-gray-300 text-xl">AI анализирует вашу ладонь...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-red-400 text-lg mb-6">{error}</p>
            <button
              onClick={reset}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {state === 'result' && result && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-3">✨</div>
              <h2 className="text-3xl font-bold text-orange-400 mb-2">{result.archetype}</h2>
              <p className="text-gray-300 italic text-lg">{result.metaphor}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Отчёт открыт</span>
                <span className="text-orange-400 font-bold">{result.progress_percent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: `${result.progress_percent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">💡 Ваши инсайты</h3>
              <div className="space-y-3">
                {result.insights.map((insight, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {result.scientific_facts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-3">🔬 Научные факты</h3>
                <div className="space-y-3">
                  {result.scientific_facts.map((fact, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.locked_blocks.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-3">🔒 Закрытые разделы</h3>
                <div className="space-y-3">
                  {result.locked_blocks.map((block, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 opacity-75">
                      <h4 className="font-bold text-white mb-2">{block.title}</h4>
                      <p className="text-gray-400 text-sm">{block.teaser}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-500 text-xs text-center">{result.disclaimer}</p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Сканировать другую ладонь
            </button>
          </div>
        )}
      </div>
    </div>
  );
}