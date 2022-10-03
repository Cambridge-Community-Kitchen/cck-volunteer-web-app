#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local"

if test -f "$ENV_FILE"; then
source $ENV_FILE
fi

HELPER="$SCRIPT_DIR/helper.sh"
source $HELPER

DATABASE_URL=$(databaseurl)
env DATABASE_URL=$DATABASE_URL bash -c 'prisma generate && prisma migrate deploy && next build'