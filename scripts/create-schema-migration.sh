#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local"
source $ENV_FILE

HELPER="$SCRIPT_DIR/helper.sh"
source $HELPER

if [ -z "$1" ]
  then
    echo "No migration name supplied, exiting"
    echo "Usage: create-schema-migration.sh my-migration-name"
    exit 1
fi

DATABASE_URL=$(databaseurl)
env DATABASE_URL=$DATABASE_URL bash -c "prisma generate && prisma migrate dev --name $1"