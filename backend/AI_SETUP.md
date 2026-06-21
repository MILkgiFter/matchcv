# AI Setup

## Groq (бесплатно, рекомендуется)

1. Зарегистрируйтесь: https://console.groq.com
2. Создайте API key
3. В `backend/.env`:
   ```
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_ваш_ключ
   AI_MODEL=llama-3.3-70b-versatile
   ```
4. Перезапустите backend: `npm run backend:dev`

Модель **Llama 3.3 70B** — реальная open-source модель, быстрая и бесплатная на Groq.

## OpenAI (платно)

```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## Проверка

Откройте http://localhost:3001/health — должно быть:
```json
{ "status": "ok", "ai": { "configured": true, "provider": "groq", "model": "llama-3.3-70b-versatile" } }
```
