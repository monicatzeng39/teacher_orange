import React, { useEffect, useState } from 'react';
import { Bike, Settings } from 'lucide-react';
import { getBackendEndpoint, setBackendEndpoint } from '../services/geminiService.ts';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [endpoint, setEndpoint] = useState('');

  useEffect(() => {
    setEndpoint(getBackendEndpoint());
  }, []);

  const save = () => {
    setBackendEndpoint(endpoint);
    setIsOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-orange-100 z-50 h-16 flex items-center justify-between shadow-sm px-4">
        <div className="flex items-center gap-2 text-orange-600">
          <div className="bg-orange-100 p-2 rounded-full">
            <Bike size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">橘子老師</h1>
            <p className="text-xs text-orange-400 font-medium">AI 自行車教練</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full text-orange-600 hover:bg-orange-50 transition"
          title="設定"
        >
          <Settings size={20} />
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="relative w-[92vw] max-w-lg bg-white rounded-2xl shadow-xl border border-orange-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">設定</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <label className="block text-xs text-gray-500 mb-2">後端 API Endpoint（選填）</label>
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="例如：https://your-worker.example.com/chat"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
              這個網站部署在 GitHub Pages（純前端）時，請勿放任何 API Key。
              若要使用真正的 AI 回覆，請建立你自己的後端（Cloudflare Workers / Netlify Functions 等），
              然後把 endpoint 貼在這裡。
            </p>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEndpoint('');
                  setBackendEndpoint('');
                  setIsOpen(false);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                使用示範模式
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
