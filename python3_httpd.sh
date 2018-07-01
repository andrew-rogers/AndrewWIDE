#!/bin/sh

export PATH="$PWD/bin:$PATH"
cd www
python3 -m http.server --cgi

