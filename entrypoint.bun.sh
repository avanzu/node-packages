#!/bin/sh
set -e
env --chdir="./services/$SERVICE" bun run "$@"