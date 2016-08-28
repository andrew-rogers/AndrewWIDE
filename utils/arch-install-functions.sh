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
export C_INCLUDE_PATH=$AW_ARCH_ROOT/usr/include

set_interp() {
  "$AW_ARCH_LD" "$AW_ARCH_ROOT/usr/bin/patchelf" --set-interpreter "$AW_ARCH_LD" "$1"
}

find_pkg() {
  echo "$AW_ARCH_PKG_SRC_DIR/$1"-[0-9]*"$AW_ARCH_PKG_EXT"
}

install_pkg() {
  local fn=$(find_pkg $1)
  local fl=$AW_ARCH_ROOT/pkginfo/$1.files
  if [ -f "$fn" ]
  then
    if [ -f "$fl" ]
    then
      echo "Already installed: $1" 1>&2
    else
      xzcat $fn | tar -xv > "$fl"
      mv .PKGINFO "pkginfo/$1.PKGINFO"
    fi
  else
    echo "Cannot find package: $1" 1>&2
  fi
}

set_so_libpath() {
  mv "$1" "$1.orig"
  cat "$1.orig" | sed "s= /usr/lib/= $AW_ARCH_ROOT/usr/lib/=g" > "$1"
}

install_base() {
  install_pkg filesystem
  install_pkg glibc
  install_pkg patchelf
  install_pkg gcc-libs
  set_so_libpath usr/lib/libc.so
}

install_bash () {
  install_base
  install_pkg ncurses
  install_pkg readline
  install_pkg bash
  set_interp usr/bin/bash
}

install_gcc_pkgs () {
  install_pkg libmpc
  install_pkg mpfr
  install_pkg gmp
  install_pkg zlib
  install_pkg linux-api-headers
  install_pkg gcc
  install_pkg binutils
}

setup_gcc () {
  local GCC_DIR=$(find $AW_ARCH_ROOT/usr/lib/gcc/ | sed -n 's=/lto-wrapper==p')
  set_interp usr/bin/gcc
  set_interp usr/bin/g++
  set_interp usr/bin/ar
  set_interp usr/bin/as
  set_interp usr/bin/ld
  set_interp $GCC_DIR/cc1
  set_interp $GCC_DIR/cc1plus
  set_interp $GCC_DIR/collect2
  set_so_libpath usr/lib/libc.so
  local dst=$GCC_DIR/specs
  gcc -dumpspecs | sed "s=/lib=$AW_ARCH_ROOT/lib=g" > "$dst"
}

test_gcc() {
  cat << EOF > test.c
#include <stdio.h>

int main( int argc, char *arg[] )
{
  printf("Compiled with GCC!\n");
  return 0;
}
EOF

  gcc test.c
  ./a.out
}

install_gcc () {
  install_base
  install_gcc_pkgs
  setup_gcc
  test_gcc
}

install_make () {
  install_pkg guile
  install_pkg gc
  install_pkg libffi
  install_pkg libunistring
  install_pkg libtool
  install_pkg libatomic_ops
  install_pkg make
  
  set_interp usr/bin/make || return
  
  # Make a wrapper for make to set the SHELL variable.
  mv usr/bin/make usr/bin/make.orig
  cat << EOF > usr/bin/make
#!$UTILS_BIN/sh

make.orig SHELL=$UTILS_BIN/sh \$@
EOF
	chmod +x usr/bin/make
}


