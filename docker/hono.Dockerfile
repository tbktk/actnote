#--------------------------------------------------------------------------------------------------
# Stage 1: Builder - Turborepoですべてのアプリケーションをビルドして剪定（prune）する
#--------------------------------------------------------------------------------------------------
FROM node:23-slim AS builder

# pnpmを利用可能か確認し、必要であればインストール
RUN corepack enable || true

WORKDIR /app

# キャッシュを効率的に利用するためにまずTurborepo/pnpmの設定ファイルをコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/

# すべてのアプリをコピー（Turborepoがpruneするためにすべてのアプリが必要）
COPY apps/ ./apps/

# ルートの依存関係をインストール
RUN pnpm install --frozen-lockfile

# Honoバックエンドをビルド
RUN pnpm turbo build --filter=api_hono

# Honoバックエンドとその依存関係のみを含むようワークスペースをprune
RUN pnpm turbo prune --scope=api_hono --docker

#--------------------------------------------------------------------------------------------------
# Stage 2: Runner - Honoアプリとその依存関係のみを含む最小イメージを作成
#--------------------------------------------------------------------------------------------------
FROM node:23-slim AS runner

WORKDIR /app

# ビルダーステージから剪定された依存関係とコードをコピー
COPY --from=builder /app/out/full/apps/api_hono /app/apps/api_hono
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/out/json/ ./

# Honoが内部的にリッスンするポートを公開
EXPOSE 3000

# Honoアプリケーションを実行するコマンド
CMD ["node", "apps/api_hono/dist/index.js"]