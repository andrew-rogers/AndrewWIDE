#!/bin/sh

export PATH="$PWD/bin:$PATH"
cd www
python2 -m CGIHTTPServer

