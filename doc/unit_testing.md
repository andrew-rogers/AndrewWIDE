# Unit Testing a Server

## Introduction
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/socket_cd.puml&v=1)

## Socket and FD Implementation for Linux
Implement OS calls to socket interface such as:

* bind
* listen
* accept
* read
* write

These are implementations of the pure virtual methods in the interface classes. Most will simply be wrappers for the C functions defined in sys/socket.h the exception being the __accept()__ method which should create a new __AwSocketLinux__ object instead of returning the file descriptor. __AwSocketLinux__ is a derivative of __AwFDLinux__ and inherits the __read()__ and __write()__ methods.

## Mock Classes
For unit testing of the server class it is necessary to remove the OS calls and replace them with calls that mock the OS calls. For unit test __AwServer__ is passed an __AwSocketMock__ instance. 


