# Google Play — Data Safety Form

Use these answers when filling the Data Safety section in Google Play Console.

## Data collected

| Data type | Collected | Purpose | Shared with third parties |
|-----------|-----------|---------|---------------------------|
| Files and docs (resume PDF/DOCX) | Yes | App functionality | Yes — AI provider (OpenAI) |
| App interactions (chat messages) | Yes | App functionality | Yes — AI provider (OpenAI) |
| Email address | Optional | Account | No |

## Data handling

- Data is encrypted in transit (HTTPS)
- Users can request deletion via support@matchcv.app
- Data is not sold to third parties

## Security practices

- API keys stored server-side only
- Mobile app uses API key authentication
- Rate limiting enabled on backend

## Privacy policy URL

Must match `EXPO_PUBLIC_PRIVACY_URL` in your `.env`.
