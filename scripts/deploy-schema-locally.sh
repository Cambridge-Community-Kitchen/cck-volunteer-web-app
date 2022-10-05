#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local"
source $ENV_FILE

HELPER="$SCRIPT_DIR/helper.sh"
source $HELPER

DATABASE_URL=$(databaseurl)
env DATABASE_URL=$DATABASE_URL bash -c "prisma generate && prisma db push"