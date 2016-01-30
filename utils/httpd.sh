
#    AndrewWIDE - http server setup and startup functions
#    Copyright (C) 2015  Andrew Rogers
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

aw-httpd-install() {
  msg "Installing HTML files."
  local src=$(aw-utils-find-src html)
  [ -n "$src" ] && cp -r "$src" "$AW_DIR"
}

aw-httpd-cgi() {
  local cgi=$AW_DIR/html/cgi-bin/aw.sh
  if [ ! -e "$cgi" ]
  then
    local src=$AW_DIR/html/cgi-bin/aw.src
    if [ -e "$src" ]
    then
      echo "#!$UTILS_BIN/$BB sh" > "$cgi"
      cat "$src" >> "$cgi"
      chmod 755 "$cgi"
      msg "Configured CGI shebang."
    else
      error "Can't find CGI script source."
    fi
  fi
}

aw-httpd() {
  aw-httpd-cgi
  $UTILS_BIN/$BB httpd -p 127.0.0.1:8080 -h "$HTML_DIR"
}
