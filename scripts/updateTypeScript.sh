#!/bin/bash

set -e

# update the TypeScript code and build
(
  cd ../TypeScript
  #  git fetch
  # git checkout origin/release-2.3
  rm -rf built/local
  jake clean
  jake local
)

# copy the necessary bin files to build
cp ../TypeScript/bin/tsc $(dirname $0)/../com.palantir.typescript/bridge/bin/
cp ../TypeScript/built/local/lib.d.ts $(dirname $0)/../com.palantir.typescript/bridge/lib/
cp ../TypeScript/built/local/tsc.js $(dirname $0)/../com.palantir.typescript/bridge/lib/

# copy the language services JavaScript and definition file
cp ../TypeScript/built/local/typescriptServices.js $(dirname $0)/../com.palantir.typescript/bridge/lib/
cp ../TypeScript/built/local/typescriptServices.d.ts $(dirname $0)/../com.palantir.typescript/bridge/typings/

# copy the default lib files into the plug-in
cp ../TypeScript/built/local/lib.d.ts $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/
cp ../TypeScript/built/local/lib.es6.d.ts $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/

# convert to unix line endings
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/lib.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/tsc.js
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/typescriptServices.js
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/typings/typescriptServices.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/lib.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/lib.es6.d.ts

read -p "Press enter to continue"