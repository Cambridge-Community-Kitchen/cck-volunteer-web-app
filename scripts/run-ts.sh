#!/usr/bin/env bash

ts-node -r tsconfig-paths/register -P scripts.tsconfig.json $1 "${@:2}"