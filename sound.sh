#!/bin/ksh

filename="/tmp/record_$$.wav"
arecord -d 1 "$filename"
sox "$filename" -n stat 2>&1 | grep "Maximum amplitude:" | awk -F " " '{ print $3 }'
