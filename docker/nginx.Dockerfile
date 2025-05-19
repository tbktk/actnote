#--------------------------------------------------------------------------------------------------
# Stage 1: Frontend Builder - フロントエンドの静的アセットをビルド
#--------------------------------------------------------------------------------------------------
FROM node:23-slim AS web_builder

# pnpmを利用可能か確認し、必要であればインストール
RUN corepack enable || true

WORKDIR /app

# キャッシュを効率的に利用するためにまずTurborepo/pnpmの設定ファイルをコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/

# モノレポ全体の依存関係解決のためにappsディレクトリ全体をコピー
COPY apps/ ./apps/

# ルートの依存関係をインストール
RUN pnpm install --frozen-lockfile

# Turborepoを使用してフロントエンドアプリケーションをビルド
# ※package.jsonのビルドスクリプトがapps/web/distに静的ファイルを生成することを要確認
RUN pnpm turbo build --filter=web

# このコンテナ内でビルド出力が配置される場所を定義
# このパスはNginxのDockerfileからコピー元として使用される
ARG WEB_BUILD_DIR=/app/apps/web/dist
ENV WEB_BUILD_DIR ${WEB_BUILD_DIR}

#--------------------------------------------------------------------------------------------------
# Stage 2: Nginx Server
#--------------------------------------------------------------------------------------------------
FROM nginx:alpine

# カスタムNginx設定ファイルをデフォルト設定ファイルに置き換える
RUN rm -rf /etc/nginx/conf.d/
COPY conf/nginx.conf /etc/nginx/nginx.conf

# フロントエンドのビルダーステージでビルドされた静的ファイルをコピー
COPY --from=web_builder ${WEB_BUILD_DIR} /usr/share/nginx/html

# Nginxのデフォルトポートを公開
EXPOSE 80

# Nginxのデフォルト設定でコンテナを起動
# ※'-g deamon off;'は、Dockerコンテナが終了しないようにするためにNginxをフォアグラウンドで実行
CMD ["nginx", "-g", "daemon off;"]