
#    AndrewWIDE - setup root filesystems in user directory or app directory
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


# ---Setup variables---
if test -f /system/bin/sh
then
  # Android setup - User may not have yet unzipped
  TERM_DIR=/data/data/$(cat /proc/$PPID/cmdline)
  AW_DIR=$TERM_DIR/AndrewWIDE
  DOWNLOAD_DIR=/sdcard/Download/AndrewWIDE
  WGET=/system/bin/wget
  BB=busybox-armv7l
  AW_ZIP=${DOWNLOAD_DIR}-master.zip
else
  # LSB - Assume user will CD into AndrewWIDE after unzipping
  AW_DIR=$PWD
  TERM_DIR=$PWD
  DOWNLOAD_DIR=$AW_DIR/Download
  WGET=$(which wget)
  #BB=busybox-i686
  BB=busybox-armv7l # use with qemu user mode on non-ARM hosts
fi

UTILS_BIN=$AW_DIR/utils/bin
PATH=$UTILS_BIN:$PATH
HTML_DIR=$AW_DIR/html
# -----------------------

AW_SRC_LOCS="/sdcard/Download/AndrewWIDE-master"

aw-utils-find-src() {
  local aw
  echo "$AW_SRC_LOCS" | while read -r aw
  do
    [ -e "$aw/$1" ] && echo "$aw/$1" && break
  done
}

aw-busybox-install() {
  local bb=$(aw-utils-find-src "utils/bin/$BB")
  [ -z "$bb" ] && error "Can't find: $BB" && return 1
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
  aw-busybox-symlinks
}

aw-install() {
  local src=$(aw-utils-find-src utils/"$1".sh)
  [ -n "$src" ] && cp "$src" "$AW_DIR/utils/"
  local scr=$AW_DIR/utils/"$1".sh
  [ -n "$scr" ] && . "$scr" && "aw-$1-install" $*
}

aw-busybox-symlink() {
  local pdir=$PWD
  cd "$UTILS_BIN"
  $BB ln -s $BB $1
  cd "$pdir"
}

aw-busybox-symlinks() {
  for app in $($BB --list)
  do
    echo "> $app"
    aw-busybox-symlink "$app"
  done
}

aw-busybox-check() {
  $UTILS_BIN/$BB true 2> /dev/null || aw-busybox-install
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

aw-start() {
  . $AW_DIR/utils/$1.sh
  aw-$1 $*
}

aw-busybox-check
cd "$AW_DIR"
