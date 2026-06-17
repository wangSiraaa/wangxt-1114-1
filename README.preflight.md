# Trae Preflight

This folder is prepared for `wangxt-1114-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18414
- API_PORT: 19414
- WEB_PORT: 20414
- DB_PORT: 21414
- REDIS_PORT: 22414

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
