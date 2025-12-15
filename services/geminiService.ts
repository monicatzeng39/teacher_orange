// 安全版：前端不持有任何 API Key。
// 這個服務只會：
// 1) 走「你自己的後端 endpoint」(建議)；或
// 2) 在未設定 endpoint 時，提供本地示範回覆（不呼叫任何外部 API）。

type StreamChunk = { text: string };

type ChatHistoryItem = {
  role: 'user' | 'model';
  text: string;
};

const LS_ENDPOINT_KEY = 'teacher_orange_backend_endpoint';

let history: ChatHistoryItem[] = [];

export const getBackendEndpoint = (): string => {
  try {
    return (localStorage.getItem(LS_ENDPOINT_KEY) || '').trim();
  } catch {
    return '';
  }
};

export const setBackendEndpoint = (endpoint: string) => {
  try {
    localStorage.setItem(LS_ENDPOINT_KEY, endpoint.trim());
  } catch {
    // ignore
  }
};

export const startChatSession = () => {
  history = [];
};

// 產生「假 streaming」：把文字切成小段，給 UI 逐段更新
async function* fakeStream(fullText: string, chunkSize = 24): AsyncGenerator<StreamChunk> {
  for (let i = 0; i < fullText.length; i += chunkSize) {
    const slice = fullText.slice(i, i + chunkSize);
    // 小延遲讓 UI 看起來像 streaming
    await new Promise((r) => setTimeout(r, 15));
    yield { text: slice };
  }
}

export const sendMessageStream = async (message: string) => {
  const endpoint = getBackendEndpoint();

  // 更新前端記錄（你也可以在後端使用）
  history.push({ role: 'user', text: message });

  // 未設定 endpoint：本地示範模式
  if (!endpoint) {
    const demo =
      '（示範模式：未設定後端）\n' +
      '我已收到你的訊息：\n' +
      message +
      '\n\n' +
      '若你想啟用真正的 AI 回覆：\n' +
      '請點右上角「設定」→ 貼上你的後端 API Endpoint（例如 Cloudflare Workers / Netlify Functions）。\n' +
      '⚠️ 請勿把 API Key 放在 GitHub Pages 前端。';

    history.push({ role: 'model', text: demo });
    return fakeStream(demo);
  }

  // 走你的後端
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error: HTTP ${res.status} ${res.statusText}\n${text}`);
  }

  // 兼容兩種回傳格式：
  // 1) { output: "..." }
  // 2) { text: "..." }
  const data = await res.json();
  const output = (data?.output ?? data?.text ?? '').toString();

  history.push({ role: 'model', text: output });
  return fakeStream(output);
};
