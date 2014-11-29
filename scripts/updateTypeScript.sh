#!/bin/bash

set -e

# update to the latest master code and build
(
  cd ../typescript
  git checkout master
  git pull
  rm -rf built/local
  jake declaration local
)

# copy the bin directory
rm -rf $(dirname $0)/../Bridge/bin/
cp -r ../typescript/bin/ $(dirname $0)/../Bridge/bin/

# copy the language services JavaScript and definition file
cp ../typescript/built/local/typescriptServices.js $(dirname $0)/../Bridge/lib/
cp ../typescript/built/local/typescriptServices.d.ts $(dirname $0)/../Bridge/typings/
