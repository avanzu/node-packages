#!/bin/sh
set -e
exec npm --prefix "services/$SERVICE" run "$@"