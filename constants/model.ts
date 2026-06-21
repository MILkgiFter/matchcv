/** SmolLM2-360M — лёгкая модель (~256 MB), работает офлайн на телефоне */
export const LOCAL_MODEL = {
  id: 'smollm2-360m-q4',
  name: 'SmolLM2 360M',
  sizeMb: 256,
  url: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct-Q4_K_M.gguf',
  filename: 'SmolLM2-360M-Instruct-Q4_K_M.gguf',
};

export const SYSTEM_PROMPT =
  'You are MatchCV Coach. Give concise, practical advice about resumes, job search, interviews, and cover letters.';
