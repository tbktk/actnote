#--------------------------------------------------------------------------------------------------
# Stage 1: Builder - PHPの依存関係をインストールし、最適化を図る
#--------------------------------------------------------------------------------------------------
FROM php:8.3-fpm-bookworm AS builder

# 必要なシステムパッケージとPHP拡張機能をインストール
RUN apt update && apt install -y \
    default-libmysqlclient-dev \
    libzip-dev \
    git \
    unzip \
    && docker-php-ext-install pdo pdo_mysql mysqli zip \
    && apt clean && rm -rf /var/lib/apt/lists/*

# Composerをインストール
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Laravelアプリケーションのルートディレクトリを作業ディレクトリに設定
# ビルドコンテキスト（モノレポのルート）から見た相対パス
WORKDIR /app/apps/api.laravel

# キャッシュを効率的に利用するためにまずはcomposerファイルをコピー
COPY apps/api.laravel/composer.json ./

# Laravelアプリケーションの残りのコードをすべてコピー
COPY apps/api.laravel/ ./

# Composer依存関係をインストール
# ※本番環境向けに開発用依存関係を除外し、オートローダーを最適化
RUN composer install --no-dev --optimize-autoloader

# Laravel固有の最適化を実行
RUN php artisan optimize && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

#--------------------------------------------------------------------------------------------------
# Stage 2: Runner - PHP-FPMを含む本番イメージ
#--------------------------------------------------------------------------------------------------
FROM php:8.3-fpm-bookworm AS runner

# ランタイムに必要なシステムパッケージとPHP拡張機能をインストール
RUN apt update && apt install -y \
    default-libmysqlclient-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mysqli zip \
    && apt clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app/apps/api.laravel

# ビルダーステージよりビルドされたアプリケーションコードと依存関係をコピー
COPY --from=builder /app/apps/api.laravel/ ./

# 権限の設定
# ※PHP-FPMを実行するユーザー（通常はwww-data）に書き込み権限を付与
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# PHP-FPMがリッスンするポートを公開
EXPOSE 9000

# コンテナ起動時にPHP-FPMをフォアグラウンドで実行するコマンド
CMD ["php-fpm"]