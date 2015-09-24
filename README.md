# AndrewWIDE
Create applications that run on Android or LSB with GUI via web browser.

The intention is to be able to edit source code or scripts via a web-browser front end. From the browser it should be possible to compile and run the code with output being passed back to the browser.

To install busybox source the rootfs-inst.sh file. Source the file as it is not executable from the sdcard directory and it also sets up environment variables and aliases in your shell.

$ source /sdcard/Download/rootfs-inst.sh

A useful alias 'cdr' will cd to the roots directory thus avoiding the need to work out where this is for your particular terminal app.

$ cdr

