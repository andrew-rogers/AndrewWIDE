#!/bin/sh

# NOTE: arbitrary execution of commands. Only allow this CGI script to run
#       on a trusted connection.

AW_DIR=$(pwd | sed "s/\/html.*//") # Find "/html" and removed it and everything after it.

listfiles() {
  find -maxdepth 1 -type d -print0 | xargs -0 -n1 printf "%s\n" | sort | sed "s/^\.\//d\t/"
  find -maxdepth 1 -type f -print0 | xargs -0 -n1 printf "%s\n" | sort | sed "s/^\.\//f\t/"
  [ -d "/sdcard/Download" ] && printf "d\t/sdcard/Download\n"
  printf "d\t$AW_DIR\n"
}

echo "Content-type: text/plain"
echo

if [ -z "$CONTENT_LENGTH" ]; then
  exit 0
fi

POST=""
if [ "$CONTENT_LENGTH" -gt 0 ]; then
  POST=$(dd bs=1 count=$CONTENT_LENGTH)
fi

SCR=$(echo -n "$POST" | head -n1) # first line
STDIN=$(echo -n "$POST" | tail -n1) # third line
STDOUT=$(echo -n "$STDIN" | base64 -d | eval "$SCR" | base64 | tr -d '\n')
echo $?
echo h2
echo -n "$STDOUT"

exit 0

