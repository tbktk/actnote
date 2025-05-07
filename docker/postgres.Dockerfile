FROM postgres:17

ENV PGDATA=/var/lib/postgresql/data
ENV TZ=Asia/Tokyo

VOLUME /var/lib/postgresql/data

EXPOSE 5432