OBJS=main.o awapp.o awsocket.o awserver.o awqueue.o awfd.o awforkingserver.o awobserver.o awsubject.o awpoll.o awprocess.o awfdobserver.o

test:	$(OBJS)
	g++ $^ -o $@

clean:
	rm -f $(OBJS)
	rm -f test
