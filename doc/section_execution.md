Section Execution
=================

Initial Document Execution
--------------------------

In the initial document execution runnable sections are executed sequentially in the order they are presented in the document.

Event Triggered Execution
-------------------------

To Do!

```mermaid
sequenceDiagram
    participant AwDoc
    participant Section as s0:Section
    participant Section1 as s1:Section
    AwDoc->>Section: execute()
    loop producers
        Section->>Section1: getOutput()
    end
    Section->>Section: func()
    loop consumers
        Section->>AwDoc: enqueue(consumer[i])
    end
```
