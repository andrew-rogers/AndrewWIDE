
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
PATH=$PATH:$UTILS_BIN
# -----------------------

BB_LOCS="$UTILS_BIN/$BB
$TERM_DIR/$BB
$DOWNLOAD_DIR/$BB
$DOWNLOAD_DIR/$BB.txt
/sdcard/Download/$BB
/sdcard/Download/$BB.txt
/sdcard/Download/AndrewWIDE-master/utils/bin/$BB"

find_bb() {
  local bb
  echo "$BB_LOCS" | while read -r bb
  do
    [ -e "$bb" ] && echo $bb && break
  done
}

install_bb() {
  local bb=$(find_bb)
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
  bb_symlinks
}

bb_symlink() {
  local pdir=$PWD
  cd "$UTILS_BIN"
  $BB ln -s $BB $1
  cd "$pdir"
}

bb_symlinks() {
  for app in $($BB --list)
  do
    echo "> $app"
    bb_symlink "$app"
  done
}

check_bb() {
  $UTILS_BIN/$BB true 2> /dev/null || install_bb
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

check_bb
cd "$AW_DIR"
