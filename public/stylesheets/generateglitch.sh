#!/bin/bash

PER=0
MAXa=45
MAXb=180
DEG=0
while [ $PER -lt 101 ]; do
	TMPa=$RANDOM
	let "TMPa %= $MAXa"
	TMPb=$RANDOM
	let "TMPb %= $MAXb"
	echo "$PER% {"
#	echo "	clip: rect(${TMPa}px,9999px,${TMPb}px,0);"
#	$deg: random($range) - $range * 0.5 + deg
	DEG="$(($TMPb-($MAXb/2)+$DEG))"
	echo " -webkit-transform: skew(${DEG}deg);"
	echo "}"
	let PER=PER+5
done
