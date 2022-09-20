#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local"

source $ENV_FILE

touch mysqlcreds.cnf
chmod 600 mysqlcreds.cnf
echo "[client]" >> mysqlcreds.cnf
echo "user=$DB_MASTER_USER" >> mysqlcreds.cnf
echo "password=\"$DB_MASTER_PASSWORD\"" >> mysqlcreds.cnf

mysql --defaults-extra-file=mysqlcreds.cnf -h "$DB_HOST"<<EOFMYSQL

CREATE USER IF NOT EXISTS '$DB_PIPELINE_USER'@'%' IDENTIFIED BY '$DB_PIPELINE_PASSWORD';
GRANT CREATE, ALTER, DROP, REFERENCES, INDEX ON *.* TO '$DB_PIPELINE_USER'@'%';

CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON $DB_NAME.* TO '$DB_USER'@'%';
EOFMYSQL

rm mysqlcreds.cnf

echo "Application database successfully created based on contents of the .env.local file"