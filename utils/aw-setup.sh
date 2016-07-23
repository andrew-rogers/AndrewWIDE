
#    AndrewWIDE - setup root filesystems in user directory or app directory
#    Copyright (C) 2015,2016  Andrew Rogers
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


# ---Setup variables---
if test -f /system/bin/sh
then
  # Android setup - User may not have yet unzipped
  TERM_DIR=/data/data/$(cat /proc/$PPID/cmdline)
  BB=busybox-armv7l
  AW_OS=Android
else
  # LSB - Assume user has AndrewWIDE-master in current directory
  TERM_DIR=$PWD
  BB=busybox-i686
  #BB=busybox-armv7l # use with qemu user mode on non-ARM hosts
  AW_OS=LSB
fi

AW_DIR=$TERM_DIR/AndrewWIDE
UTILS_BIN=$AW_DIR/utils/bin
PATH=$UTILS_BIN:$PATH
HTML_DIR=$AW_DIR/html
# -----------------------

AW_SRC_LOCS="/sdcard/Download/AndrewWIDE-master
$TERM_DIR/AndrewWIDE-master"

aw_find_src_dir() {
  local sd
  echo "$AW_SRC_LOCS" | while read -r sd
  do
    [ -e "$sd/" ] && echo "$sd" && break
  done
}

AW_SRC_DIR=$(aw_find_src_dir)

aw_busybox_install() {
  local bb="$AW_SRC_DIR/utils/bin/$BB"
  [ ! -f "$bb" ] && error "Can't find: $BB" && return 1
  msg "Found busybox at: $bb"

  if [ "$bb" == "$UTILS_BIN/$BB" ]
  then
    chmod 755 "$UTILS_BIN/$BB"
  else # not in $UTILS_BIN/$BB so copy
    # Android may not have cp, use cat
    [ "$bb" != "$TERM_DIR/$BB" ] && cat "$bb" > "$TERM_DIR/$BB"
    chmod 755 "$TERM_DIR/$BB"

    # if $UTILS_BIN dir doesn't exist create it
    [ -e "$UTILS_BIN" ] || $TERM_DIR/$BB mkdir -p "$UTILS_BIN"

    # mv busybox to $UTILS_BIN dir
    cat "$TERM_DIR/$BB" > "$UTILS_BIN/$BB"
    chmod 755 "$UTILS_BIN/$BB"
    [ -e "$UTILS_BIN/$BB" ] && $UTILS_BIN/$BB rm "$TERM_DIR/$BB"
    [ -e "$UTILS_BIN/$BB" ] && msg "Relocated busybox to: $UTILS_BIN/$BB"
  fi
  
  msg "Making symlinks for busybox applets, could take a while."
  aw_busybox_symlinks
}

aw_install() {
  local ext=$1
  local src="$AW_SRC_DIR"/utils/"$1".sh
  [ -f "$src" ] && aw_install_file utils/"$1".sh
  local scr=$AW_DIR/utils/"$1".sh
  shift
  [ -n "$scr" ] && . "$scr" && aw_"$ext"_install $*
}

aw_install_file() {
  $BB cp "$AW_SRC_DIR/$1" "$AW_DIR/$1"
}

aw_run_sh() {
  local script=$1
  shift
  $BB sh "$AW_DIR/$script" $*
}

aw_busybox_symlink() {
  local pdir=$PWD
  cd "$UTILS_BIN"
  $BB ln -s $BB $1
  cd "$pdir"
}

aw_busybox_symlinks() {
  for app in $($BB --list)
  do
    echo "> $app"
    aw_busybox_symlink "$app"
  done
}

aw_busybox_check() {
  $UTILS_BIN/$BB true 2> /dev/null || aw_busybox_install
}

# Print string on stderr
error()
{
  echo "$1" 1>&2
}
# Print string on stderr
msg()
{
  echo "$1" 1>&2
}

aw_start() {
  local service=$1
  shift
  . $AW_DIR/utils/$service.sh
  aw_"$service" $*
}

aw_busybox_check
cd "$AW_DIR"
AW_ARCH=$($BB uname -m)
PATH="$UTILS_BIN"

