# This shell script is used for unit testing by awprocess_test.cpp

cmd=$1

if [ -n "$2" ]; then
    delay=$2
else
    delay=1
fi


case $cmd in
    "cnt" )
	echo "1one"
	sleep $delay
	echo "2two"
	sleep $delay
	echo "3three"
	sleep $delay
	echo "4four"
	sleep $delay
	echo "5five"
    ;;

    "linesum" )
	while read line; do
	   echo ">$line" | md5sum
	   sleep $delay
	done
    ;;
esac

