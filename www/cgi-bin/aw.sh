#!/bin/sh

# NOTE: arbitrary execution of commands. Only allow this CGI script to run
#       on a trusted connection.

if [ ! -d "$AW_DIR" ]; then
    AW_DIR=$(echo "$PWD" | sed 's/\/www.*//')
fi

export AW_DIR

listfiles() {
  # If specified directory is invalid use $AW_DIR
  if [ -d "$1" ]; then
    cd "$1"
  else
    cd "$AW_DIR"
  fi

  # First line is full path of current directory
  pwd

  # List the directories
  find -maxdepth 1 -type d -print0 | xargs -0 -n1 printf "%s\n" | sort | sed "s/^\.\//d\t/"

  # List the files
  find -maxdepth 1 -type f -print0 | xargs -0 -n1 printf "%s\n" | sort | sed "s/^\.\//f\t/"

  # Filesystem shortcuts
  [ -d "/sdcard" ] && printf "d\t/sdcard\n"
  printf "d\t$AW_DIR\n"
}

build()
{
  EXT=$(echo "$1" | sed "s|.*\.||")
  if [ "$EXT" == "awcpp" ]; then
    "$AW_DIR/bin/build_awcpp" "$1"
  else
    build1 "$1"
  fi
}

build1()
{
  # Get full directory name
  MK_DIR=$(cd $(dirname "$1") && pwd)

  # Iterate through parent directories looking for Makefile
  while [ "$MK_DIR" != "$AW_DIR" ]; do

    # Break out if we get to root
    [ -z "$MK_DIR" ] && break
    [ "$MK_DIR" == "/" ] && break

    # If there's a Makefile then make
    if [ -f "$MK_DIR/Makefile" ]; then
      CGI=$(basename "$MK_DIR")
      (cd "$MK_DIR" && make CGI="$CGI" 2>&1)
      (cd "$AW_DIR/www/cgi-bin" && ln -s "$MK_DIR/$CGI") 2>&1
      echo "JSON{\"cgi\":\"$CGI\"}"
      break
    fi

    # Parent directory
    MK_DIR=$(dirname "$MK_DIR")
  done
}

echo "Content-type: text/plain"
echo

if [ -z "$CONTENT_LENGTH" ]; then
  set
  exit 0
fi

POST=""
if [ "$CONTENT_LENGTH" -gt 0 ]; then
  POST=$(dd bs=1 count=$CONTENT_LENGTH)
fi

SCR=$(echo -n "$POST" | head -n1 | sed 's/\\/\\\\/g') # first line, escape backslashes prior to eval
STDIN=$(echo -n "$POST" | tail -n1) # third line
cd "$AW_DIR"
STDOUT=$(echo -n "$STDIN" | base64 -d | eval "$SCR" | base64 | tr -d '\n')
echo $?
echo h2
echo -n "$STDOUT"

exit 0

