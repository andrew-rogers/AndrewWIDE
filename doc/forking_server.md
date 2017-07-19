# AndrewWIDE Forking Server

## Introduction
At the centre of the AndrewWIDE framework is a server that forks other processes. When a connection is made the server, after accepting the connection, immediately forks to handle the session. In this way sessions can be handled independently and can readily spawn sub-processes for data handling. Such sub-processes could be existing command line tools or user developed specialised data handling processes.

## Forking Server

The activity diagram below outlines the main activity of the forking server:
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/forkingserver_ad.puml)

## Session Activity 

Session activity is concerned with passing data from a remote client to the data handling process and vice-versa. This is illustrated by the following activity diagram: 
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/process_session_ad.puml)

## Event Loop

Events will be generated from many sources, this includes the listening socket, connected session sockets and sub-processes. To handle these events and event loop is used. The event loop has to handle application generated events and system events.
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/eventloop_ad.puml)
Examples of system generated events are those that are generated on file descriptors representing socket descriptors and process pipe descriptors. Most operating systems provide a __poll()__ function which waits until an event on a file descriptor occurs.
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/poll_ad.puml)

## Example Scenarios
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/read_event_sd.puml)
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/read_write_sd.puml)
![alternative text](http://www.plantuml.com/plantuml/proxy?src=https://github.com/andrew-rogers/AndrewWIDE/raw/master/doc/class_diagram.puml)
