#!/bin/sh

#    AndrewWIDE - http server setup and startup functions
#    Copyright (C) 2017  Andrew Rogers
#
#    This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation; either version 2 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License along
#    with this program; if not, write to the Free Software Foundation, Inc.,
#    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

PDIR="$PWD"
cd $(dirname $0)
AW_DIR="$PWD"
cd "$PDIR"

BB="busybox"

busybox_links() {
  BB_PATH=$(which "$BB")
  if [ $? -eq 0 ]; then
    BB_DIR=$(dirname "$BB_PATH")
    if [ ! -L "$BB_DIR/head" ]; then
      cd "$BB_DIR"
      for fn in $("$BB_PATH" --list); do
        ln -s "$BB" "$fn"
      done
      cd "$PDIR"
    fi
  else
    echo "Can't locate busybox. Check that busybox is in path." 1>&2
  fi
}

fix_cgi_shebang() {
  local sb="#!$(which sh)"
  for fn in $(find "$AW_DIR/www/cgi-bin/" -type f); do
    local sbf=$(head -n1 "$fn")
    if [ "$sbf" != "$sb" ]; then
      sed -i "1s|#!.*|$sb|" "$fn"
    fi
  done
}

CMD=$1
[ -n "$CMD" ] && shift
case $CMD in

  "start" )
    fix_cgi_shebang
    httpd -p 8080 -h "$AW_DIR/www"
  ;;

  "make_busybox_links" )
    busybox_links
  ;;

  * )
    echo "Commands:"
    echo "  start"

esac
