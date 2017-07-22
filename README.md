# AndrewWIDE
Create applications that run on Android or LSB with GUI via web browser.

The intention is to be able to edit source code or scripts via a web-browser front end. From the browser it should be possible to compile and run the code with output being passed back to the browser.

## Security Notice

Only run AndrewWIDE services on a secure and trusted network. Traffic is currently unencrypted and the AndrewWIDE service intentionally enables administrative access to the host.

## Status
Markdown editor working, also has maths support via MathJax. 

## Installation on Android device

### Prerequisites
- An Android device with ARM7 (or compatible, eg. ARM8) CPU.
- A terminal app, eg. [ConnectBot](https://f-droid.org/repository/browse/?fdid=org.connectbot)
- [ArchOnAndroid](https://github.com/andrew-rogers/ArchOnAndroid) installed

### Downloading AndrewWIDE
Click the 'Download ZIP' button above-right or [here](https://github.com/andrew-rogers/AndrewWIDE/archive/master.zip).

### Extracting
Extract the AndrewWIDE-master.zip in to your ArchOnAndroid directory using unzip, similar to below:

> /data/data/org.connectbot/ArchOnAndroid $ unzip /sdcard/Download/AndrewWIDE-master.zip

### Running

The shebang line of the aw-services.sh script needs to be set, this can be done using 'aoa set_shebang' function:

> $ aoa set_shebang AndrewWIDE-master/aw-services.sh

Now it is ready to run

> $ ./AndrewWIDE-master/aw-services.sh start

It should now be possible to access AndrewWIDE from the browser [here](http://127.0.0.1:8080/)

## Notes

The CppUTest source can be downloaded using wget:

> $ wget https://github.com/cpputest/cpputest/archive/master.zip -O cpputest.zip