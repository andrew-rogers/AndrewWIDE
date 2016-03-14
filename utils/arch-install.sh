#    AndrewWIDE - ArchLinux installation script
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

. $AW_DIR/utils/arch-install-functions.sh

# check if root dir exists
if [ -d "$AW_ARCH_ROOT" ]
then
  PDIR=$PWD
  cd $AW_ARCH_ROOT
  echo "pkg>$1"
  install_$1
  cd $PDIR
else
  echo "Cannot find: $AW_ARCH_ROOT"
fi
