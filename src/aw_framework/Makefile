OBJS=main.o awapp.o awfdlistener.o awsocket.o awserver.o

test:	$(OBJS)
	g++ $^ -o $@

clean:
	rm -f $(OBJS)
	rm -f test
