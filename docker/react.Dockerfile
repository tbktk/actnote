FROM node:23-slim AS builder

# pnpmを利用可能か確認し、必要であればインストール
RUN corepack enable || true
# RUN npm install -g pnpm

WORKDIR /app

# キャッシュを効率的に利用するためにまずTurborepo/pnpmの設定ファイルをコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/

# モノレポ全体の依存関係解決のためにappsディレクトリ全体をコピー
COPY apps/ ./apps/

# ルートの依存関係をインストール
RUN pnpm install --frozen-lockfile

# Turborepoを使用してフロントエンドアプリケーションをビルド
# ※package.jsonのビルドスクリプトがapps/frontend/distに静的ファイルを生成することを要確認
RUN pnpm turbo build --filter=frontend

# このコンテナ内でビルド出力が配置される場所を定義
# このパスはNginxのDockerfileからコピー元として使用される
ARG FRONTEND_BUILD_DIR=/app/apps/frontend/dist
ENV FRONTEND_BUILD_DIR ${FRONTEND_BUILD_DIR}

# ビルダーステージのためCMDは不要