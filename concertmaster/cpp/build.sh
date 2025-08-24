#!/bin/bash

# gcc src/music_utils.cpp -o "build/music_utils" \
#     -I "$PWD/src"
# echo "YAY"
# gcc src/island.cpp\
#     -I "$PWD/src"
gcc src/main.cpp -o "build/main" \
    -I "$PWD/src"