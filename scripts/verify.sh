#!/bin/bash
set -e

rm -rf build

npm install
npm install gulp
gulp --no-color

