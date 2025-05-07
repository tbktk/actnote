FROM php:8.3-fpm-bookworm

# 必要なPHP拡張モジュールをインストール
RUN apt update && apt install -y \
    libzip-dev \
    nginx \
    unzip \
    && docker-php-ext-install zip pdo pdo_mysql

# Composerのインストール
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

# 作業用ディレクトリを設定
WORKDIR /var/www/html

# Laravelをコピー
COPY ./apps/backend-laravel/ .

# Nginxの設定ファイルをコピー
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

# 権限の設定
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Laravelの依存関係をインストール
RUN composer install --no-dev --optimize-autoloader

# Laravelのキャッシュをクリア
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# NginxとPHP-FPMを起動
CMD service nginx start && php-fpm