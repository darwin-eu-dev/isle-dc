# syntax=docker/dockerfile:1.5.1
ARG REPOSITORY=islandora
ARG TAG=2.0.10
FROM ${REPOSITORY}/drupal:${TAG} as step1

COPY codebase /var/www/drupal

RUN composer install -d /var/www/drupal && \
    chown -R nginx:nginx /var/www/drupal && \
    cleanup.sh
