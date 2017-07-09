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

local pdir="$PWD"
cd $(dirname $0)
local HTML_DIR="$PWD/html"
cd "$pdir"

fix_cgi_shebang() {
  local sb="#!$(which sh)"
  for fn in $(find "$HTML_DIR/cgi-bin/" -type f); do
    local sbf=$(head -n1 "$fn")
    if [ "$sbf" != "$sb" ]; then
      sed -i "1s|#!.*|$sb|" "$fn"
    fi
  done
}

local cmd=$1
[ -n "$cmd" ] && shift
case $cmd in

  "start" )
    fix_cgi_shebang
    httpd -p 127.0.0.1:8080 -h "$HTML_DIR"
  ;;

  * )
    echo "Commands:"
    echo "  start"

esac
