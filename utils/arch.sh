
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
export AW_ARCH_PKG_EXT=$AW_ARCH.pkg.tar.xz
export AW_ARCH_LD=$AW_ARCH_ROOT/lib/ld-linux-$AW_ARCH.so.1
export LD_LIBRARY_PATH=$AW_ARCH_ROOT/lib
export LD_PRELOAD=
export AW_DIR
export C_INCLUDE_PATH=$AW_ARCH_ROOT/usr/include
export CPLUS_INCLUDE_PATH=$AW_ARCH_ROOT/usr/include
export PATH="$AW_ARCH_ROOT/bin":"$AW_ARCH_ROOT/usr/bin":"$PATH"
export UTILS_BIN

if [ "$AW_OS" == "LSB" ]
then
  export AW_ARCH_PKG_SRC_DIR=~/Downloads/
fi

if [ "$AW_ARCH" == "i686" ]
then
  export AW_ARCH_LD=$AW_ARCH_ROOT/lib/ld-linux.so.2
fi

aw_arch_install() {
  mkdir -p $AW_ARCH_ROOT/pkginfo
  aw_install_file "utils/arch-install-functions.sh"
  aw_install_file "utils/arch-install.sh"

  # Run install script
  aw_run_sh "utils/arch-install.sh" "$1"
}

aw_arch() {
  echo "Environment variables setup for ArchLinux."
}
