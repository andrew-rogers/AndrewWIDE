#!/bin/sh

# NOTE: arbitrary execution of commands. Only allow this CGI script to run
#       on a trusted connection.

echo "Content-type: text/plain"
echo
POST="$(head -n3)" # capture first three lines from stdin
SCR=$(echo -n "$POST" | head -n1) # first line
STDIN=$(echo -n "$POST" | tail -n1) # third line
STDOUT=$(echo -n "$STDIN" | base64 -d | eval "$SCR" | base64 | tr -d '\n')
echo $?
echo h2
echo -n "$STDOUT"