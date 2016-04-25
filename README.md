# AndrewWIDE
Create applications that run on Android or LSB with GUI via web browser.

The intention is to be able to edit source code or scripts via a web-browser front end. From the browser it should be possible to compile and run the code with output being passed back to the browser.

## Status
Got ArchLinux gcc working. Uses ArchLinux aarch64 packages.
Markdown editor working, also has maths support via MathJax. 

## Installation on Android device

### Prerequisites
- An Android device with ARM7 (or compatible, eg. ARM8) CPU.
- An app to extract a zip file, eg. [Ghost Commander](https://f-droid.org/repository/browse/?fdid=com.ghostsq.commander)
- A terminal app, eg. [ConnectBot](https://f-droid.org/repository/browse/?fdid=org.connectbot)

### Downloading AndrewWIDE
Click the 'Download ZIP' button above-right or [here](https://github.com/andrew-rogers/AndrewWIDE/archive/master.zip).

### Extracting
Navigate to AndrewWIDE-master.zip in your Download directory. Unzip into Download directory. If you are using Ghost Commander, press and hold AndrewWIDE-master.zip until menu appears, then select 'Extract ZIP'.

### Running

To install busybox source the aw-setup.sh file provided in the utils directory. Source the file as it is not executable from the sdcard directory and it also sets up environment variables and aliases in your shell. Use '.' and not 'source' otherwise PATH is not set.

> $ . /sdcard/Download/AndrewWIDE-master/utils/aw-setup.sh

Copy the above command, excluding the '$', into terminal app. ConnectBot allows you to add this to Post-login automation thus you can easily create an entry to start this automatically in the Hosts menu in ConnectBot.

### ArchLinux
Download required packages to /sdcard/Download/ before running. Currently these are:

* filesystem
* glibc
* gcc-libs
* ncurses
* readline
* bash
* patchelf 
* libmpc
* mpfr
* gmp
* zlib
* gcc
* binutils

Then run the installer to install gcc form Arch packages

> $ aw-install arch gcc

The installation takes about 20 seconds on a Lenovo TAB2 A8-50F. The installer tests gcc by compiling a very simple program.

Dependency resolution is not yet implemented, nor are .INSTALL functions executed. patchelf is used to modify the interpreter for ld-linux-aarch64.so.1 to the location in our filesystem. It might be possible to use wget to download packages, this is future work.