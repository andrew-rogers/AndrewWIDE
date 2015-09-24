
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
  # Android setup
  ROOTS=/data/data/$(cat /proc/$PPID/cmdline)/roots
  DOWNLOAD_DIR=/sdcard/Download
  WGET=/system/bin/wget
  BB=busybox-armv7l
else
  # LSB
  ROOTS=$PWD
  DOWNLOAD_DIR=$ROOTS/Download
  WGET=$(which wget)
  BB=busybox-i686
fi
BB_URL="http://www.busybox.net/downloads/binaries/latest/$BB"
UTILS_BIN=$ROOTS/utils/bin
# -----------------------

# Print string on stderr
error()
{
  echo "$1" 1>&2
}

# Create a directory if it does not exist
create_dir()
{
  test -e $1 || mkdir -p $1
}

# Check for downloaded file in DOWNLOAD_DIR
check_download()
{
  DN=$DOWNLOAD_DIR/$1
  
  if test -f "$DN"
  then 
    echo "$DN"
  else
    DN=$DN.txt
    if test -f "$DN"
    then
      echo "$DN"
    fi
  fi
}

# Download file if we have wget
download()
{
  if test -x "$WGET"
  then
    $WGET "$1" -O "$DOWNLOAD_DIR/$2" || rm -f "$DOWNLOAD_DIR/$2"
  else
    error "Could not download '$1' as we don't have wget. Please use your browser to download manually."
  fi
}

# Get path of a download, do the download if not found.
check_or_download()
{
  DN=$(check_download $1)

  if test -f "$DN"
  then
    echo "$DN"
  else 
    download $2 $1
    DN=$(check_download $1)
    echo "$DN"
  fi
 
  test -f "$DN" || error "Could not locate $1 in $DOWNLOAD_DIR, please download or rename."
}

# Install a binary
install_binary()
{
  local IL=$1
  local DL=$2
  local URL=$3
  if test ! -f "$IL"
  then
    local DPATH=$(check_or_download $DL $URL)
    if test -n "$DPATH"
    then
      cp $DPATH $IL && chmod 755 $IL
    fi
  fi
}

# Check for busybox links
busybox_symlinks()
{
  local BIN=$1
  local BBB=$BIN/busybox
  if test ! -L "$BIN/wget"
  then
    install_binary $BBB $BB $BB_URL
    chmod 755 $BBB
    $BBB --install -s $1
  fi
}

ar_ls()
{
  dd if=$1 bs=1 count=10
}

create_dir $DOWNLOAD_DIR
create_dir $UTILS_BIN
busybox_symlinks $UTILS_BIN
PATH=$UTILS_BIN:$PATH
alias cdr="cd $ROOTS"

