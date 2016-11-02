# Requirements for AndrewWIDE

The summary requirement for AndrewWIDE is to facilitate software development via a HTML5 compatible web browser allowing software source code to be edited remotely. AndrewWIDE shall also provide a means of server administration via the web interface.

## Container and Installer App for Android

The app name for the installer shall be 'org.andrewwide'. The installer shall search for or download a zip file, expand this zip file and execute a binary as specified below. In this manner the app's file system becomes the container for the AndrewWIDE files.

### Expanding the Zip Archive

The app shall, by default, only expand the zip archive if it has not already done so. The installer may optionally provide a means for the user to force an expansion.

The installer shall search for the following in the specified order:
1. In the Download directory '/sdcard/Download/AndrewWIDE-master.zip' as this is the likely default location that the browser would place the file if the user manually downloaded the latest from GitHub.
2. Download from GitHub, https://github.com/andrew-rogers/AndrewWIDE/archive/master.zip, and saved in the Download directory, '/sdcard/Download/AndrewWIDE-master.zip'.
The above search order ensures that the archive is only downloaded once. The installer may optionally provide an means for the user to force a download.

The above steps, if successful, will result in a zip file being present at '/sdcard/Download/AndrewWIDE-master.zip'. This zip archive shall be expanded into '/data/data/org.andrewwide/'. Correct expansion of the zip archive will result in the __android.conf__ file having the full path, '/data/data/org.andrewwide/android.conf'.

### Running the Setup Command

The installer app for Android shall execute a command as specified in the __android.conf__ file. The format of this file
can be defined on implementation but shall be human readable and editable using a simple text editor. The location of this file shall be at the root directory of the above mentioned zip archive. An example implementation could make use of the Java provided __Runtime.exec()__ where the argument is a string constructed by reading the first line of __android.conf__ that begins with 'EXEC=' and stripping the 'EXEC=' prefix. It is likely that the full path will need to be provided to __Runtime.exec()__ thus the argument string will require a prefix of '/data/data/org.andrewwide/'.
