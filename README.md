# AndrewWIDE

A Web Interactive Documentation Environment.

Despite the results looking fairly impressive, there are only a handful of Javascripts and C++ files forming the essential part of AndrewWIDE.

## History
Once intended to be Web Integrated Development Environment, AndrewWIDE is now a Web Interactive Documentation Environment. Various editors where written with CGI back-ends written as shell scripts and running from [busybox](https://busybox.net/). As one of my key requirements (or was it a vague passing interest?) was to experiment with DSP written C and C++ such as [KFR](https://www.kfrlib.com/) and [GNU Radio](https://www.gnuradio.org/) GCC was required. For this, the [Arch Linux](https://archlinux.org/) binaries were patched with patchelf and made to run on Android.

As it was now possible to write the application logic in C++ and have a GUI in the web browser it meant that apps could be developed for Android devices without using Android Studio. As the experiments continued, AndrewWIDE was becoming very messy. The Arch Linux aspect became a separate project called [ArchOnAndroid](https://github.com/andrew-rogers/ArchOnAndroid) but hit a dead-end when newer Android devices required Position Independent Executable (PIE) binaries and the Arch Linux binaries were non-PIE. By this time, Linux distros were beginning emerge for non-rooted Android devices such as [Termux](https://termux.com/) so I could abandon ArchOnAndroid.

Experiments with [marked](https://marked.js.org/) and [MathJax](http://docs.mathjax.org/en/latest/index.html) eventually reshaped the project to become an educational tool that could both document DSP algorithms and demonstrate C++ models. This has now become the focus of this project and work has begun to remove the shell scripted CGIs and replace them with binaries written in C++.

## Current Work
The previous shell scripted CGIs are now replaced by an experimental binary CGI written in C++. This means there are significant changes in the Javascript running in the browser to remove the shell commands embedded into the XHR requests as well as the new C++ CGI itself. The code generator is simplified due to the use of dynamic linking from the CGI which was not possible with the shell scripts. Most of the AndrewWIDE components are not documented nor flow from a consistent design which in part is due to the experimental history involved with running on Android.

The format of the AwDoc (which is the document source format) is stabilising and is now ready for an initial release once its format is documented. The test editor still relies on shell scripted CGIs and this needs migrating to the C++ CGIs. As the AwDoc is text based, many text editors can be used. For Android users (and for editing in the browser), a new editor is being designed that will use [Ace](https://ace.c9.io/).

AndrewWIDE was an experiment demonstrated to academics at coffee shops and usage instructions were never produced. Due to Covid-19 restrictions these meetings ceased meaning that the user base would now be online without one to one conversation. This necessitates written usage instructions and removal of the current quirks like having to embed the awdoc name in the URL with the '/'s written as '%2F' such as [http://127.0.0.1:8000/AwDocViewer.html?file=doc%2Fawcpp.awdoc](http://127.0.0.1:8000/AwDocViewer.html?file=doc%2Fawcpp.awdoc).

## Future Aims
To produce self contained HTML interactive pages using webassembly. Self contained webassembly html pages are working on Firefox but it appears that for Chrome webassembly only works from a HTTP server. All known users and forks of AndrewWIDE are currently running HTTP servers and there is little community interest in self contained webassembly HTML pages at this time. I will invest more time in this when the interest arises.

## Security Notice

Only run AndrewWIDE on a secure and trusted network. Traffic is currently unencrypted and AndrewWIDE intentionally enables administrative access to the host.

## Status
Binary CGI for building C++ shared objects now working.

## Installation

### Android

Instructions to follow. Most likely will depend on [Termux](https://termux.com/) for its C++ support. The webserver might possibly be the busybox httpd applet or based on ttyd rather than rely on Python http.server module.

### Linux

```
[andrew@M3400 AndrewWIDE]$ cd src/
[andrew@M3400 src]$ make
[andrew@M3400 src]$ cd cgi
[andrew@M3400 cgi]$ make
[andrew@M3400 cgi]$ cd ../../
[andrew@M3400 AndrewWIDE]$
```

Runs using the Python HTTP server module using the included **python3_httpd.sh** file.

```
[andrew@M3400 AndrewWIDE]$ ./python3_httpd.sh
```

### Windows

Compiles under [MinGW](http://mingw.osdn.io/index.html), for [Cygwin](https://www.cygwin.com/) the Linux instructions work.

```
C:\Users\ProfCodey\AndrewWIDE>cd src
C:\Users\ProfCodey\AndrewWIDE\src>mingw32-make
C:\Users\ProfCodey\AndrewWIDE\src>cd cgi
C:\Users\ProfCodey\AndrewWIDE\src\cgi>mingw32-make
C:\Users\ProfCodey\AndrewWIDE\src\cgi>cd ..
C:\Users\ProfCodey\AndrewWIDE\src>cd ..
C:\Users\ProfCodey\AndrewWIDE>
```

Runs using the Python HTTP server module using the included **httpd.bat** file.

```
C:\Users\ProfCodey\AndrewWIDE>httpd.bat
```

### Downloading AndrewWIDE
Click the 'Download ZIP' button above-right or [here](https://github.com/andrew-rogers/AndrewWIDE/archive/master.zip).

### Extracting
Extract the AndrewWIDE-master.zip in to your ArchOnAndroid directory using unzip, similar to below:

> /data/data/org.connectbot/ArchOnAndroid $ unzip /sdcard/Download/AndrewWIDE-master.zip

## Notes

The CppUTest source can be downloaded using wget:

> $ wget https://github.com/cpputest/cpputest/archive/master.zip -O cpputest.zip

Being used in universities around the world. If you have an related article, drop me a link and I will included it here.
