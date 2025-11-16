# Todo App (React + TypeScript + Vite)

Docker上でVite開発サーバを動かすTodoアプリの教材プロジェクトです。

## 開発サーバ

- 起動: `docker compose up -d`
- URL: http://localhost:5173/

## コマンド

- `docker compose up -d` コンテナ起動
- `docker compose down` コンテナ停止
- `docker compose exec -w /workspace/web app npm run build` 本番ビルド

## 構成
- `web/` React + TypeScript (Vite)
- `Dockerfile` / `docker-compose.yml` 開発用コンテナ設定
- `docs/react_web_course.md` 3時間ハンズオン手順

