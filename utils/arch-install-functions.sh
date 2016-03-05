#    AndrewWIDE - ArchLinux installation functions
#    Copyright (C) 2016  Andrew Rogers
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

export LD_LIBRARY_PATH=$AW_ARCH_ROOT/lib
export LD_PRELOAD=

set_interp() {
  "$AW_ARCH_LD" "$AW_ARCH_ROOT/usr/bin/patchelf" --set-interpreter "$AW_ARCH_LD" "$1"
}

find_pkg() {
  echo "$AW_ARCH_PKG_SRC_DIR/$1"-[0-9]*"$AW_ARCH_PKG_EXT"
}

install_pkg() {
  local fn=$(find_pkg $1)
  xzcat $fn | tar -xv
}
