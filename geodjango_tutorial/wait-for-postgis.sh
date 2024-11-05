#!/bin/bash

set -e

container_name="$1"
shift
cmd="$@"

while true; do
  logs=$(docker logs "$container_name" 2>&1)
  if echo "$logs" | grep -q "pg_cron scheduler started"; then
    >&2 echo "Postgres is up - starting the server"
    break
  else
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  fi
done

exec $cmd