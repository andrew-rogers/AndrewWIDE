#!/bin/sh

# NOTE: Arbitrary execution of binaries. Only allow this CGI script to run
#       on a trusted connection.

# If all binaries are run via this script then a security layer can be built
#       into this one script to prevent unauthorised execution of binaries
#       when the need arises in the future. The protected binaries will be
#       placed elsewhere and not in the cgi-bin directory.

# Read the sh chunk line by line until BINARY
# execute the binary to absorb remaining stdin.

LINE=""

getline() {
	LINE=""
	while [ $CONTENT_LENGTH -gt 0 ]; do
		local ch=$(dd bs=1 count=1 2> /dev/null)
		let CONTENT_LENGTH=CONTENT_LENGTH-1
		if [ -z "$ch" ]; then
			break
		fi
		LINE="$LINE$ch"
	done
}

while [ "$CONTENT_LENGTH" -gt 0 ]
do
	getline
	if [ "$LINE" == "BINARY" ]; then
        break
    fi

    # At the moment we just evaluate each line. 
    eval "$LINE"
done

# If the command is defined then execute it
if [ -n "$CMD" ]; then
    $CMD
fi 
