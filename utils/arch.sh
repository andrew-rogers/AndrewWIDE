
#    AndrewWIDE - ArchLinux setup and startup functions
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

export AW_ARCH_ROOT=$AW_DIR/roots/arch
export AW_ARCH_PKG_SRC_DIR=/sdcard/Download
export AW_ARCH_PKG_EXT=aarch64.pkg.tar.xz
export AW_ARCH_LD=$AW_ARCH_ROOT/lib/ld-linux-aarch64.so.1
export LD_LIBRARY_PATH=$AW_ARCH_ROOT/lib
export LD_PRELOAD=
export AW_DIR

aw-arch-install() {
  local root=$AW_ARCH_ROOT

  # Copy install & startup scripts
  mkdir -p $root/utils
  mkdir -p $root/sdcard
  cp "$AW_SRC_DIR/utils/arch-install-functions.sh" "$AW_DIR/utils/"
  cp "$AW_SRC_DIR/utils/arch-install.sh" "$AW_DIR/utils/"

  # Run install script
  sh "$AW_DIR/utils/arch-install.sh"
}

aw-arch() {
  PATH="$AW_ARCH_ROOT/bin":"$AW_ARCH_ROOT/usr/bin":"$PATH"
  "$AW_ARCH_ROOT/bin/bash"
}
