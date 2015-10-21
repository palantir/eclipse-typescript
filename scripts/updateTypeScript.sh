#!/bin/bash

set -e

# update the TypeScript code and build
(
  cd ../TypeScript
  git fetch
  git checkout origin/release-1.7
  rm -rf built/local
  jake clean
  jake local
)

# copy the necessary bin files to build
cp ../typescript/bin/tsc $(dirname $0)/../com.palantir.typescript/bridge/bin/
cp ../typescript/built/local/lib.d.ts $(dirname $0)/../com.palantir.typescript/bridge/lib/
cp ../typescript/built/local/tsc.js $(dirname $0)/../com.palantir.typescript/bridge/lib/

# copy the language services JavaScript and definition file
cp ../typescript/built/local/typescriptServices.js $(dirname $0)/../com.palantir.typescript/bridge/lib/
cp ../typescript/built/local/typescriptServices.d.ts $(dirname $0)/../com.palantir.typescript/bridge/typings/

# copy the default lib files into the plug-in
cp ../typescript/built/local/lib.d.ts $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/
cp ../typescript/built/local/lib.es6.d.ts $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/

# convert to unix line endings
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/lib.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/tsc.js
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/typescriptServices.js
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/typings/typescriptServices.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/lib.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/lib.es6.d.ts
