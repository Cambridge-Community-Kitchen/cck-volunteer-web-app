#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local"

source $ENV_FILE

DB_MASTER_PASSWORD=$(tr -dc 'A-Za-z0-9!&()*+,-.:;<=>?[]^{|}~' </dev/urandom | head -c 32)
DB_PIPELINE_PASSWORD=$(tr -dc 'A-Za-z0-9!&()*+,-.:;<=>?[]^{|}~' </dev/urandom | head -c 32)
DB_PASSWORD=$(tr -dc 'A-Za-z0-9!&()*+,-.:;<=>?[]^{|}~' </dev/urandom | head -c 32)
JWT_SS=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 64)

echo "DB_MASTER_PASSWORD=\"$DB_MASTER_PASSWORD\"" >> ${ENV_FILE}
echo "DB_PIPELINE_PASSWORD=\"$DB_PIPELINE_PASSWORD\"" >> ${ENV_FILE}
echo "DB_PASSWORD=\"$DB_PASSWORD\"" >> ${ENV_FILE}
echo "JWT_SS=\"$JWT_SS\"" >> ${ENV_FILE}

echo "Randomly generated passwords successfully added to the .env.local file"