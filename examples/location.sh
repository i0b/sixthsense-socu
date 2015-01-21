#!/bin/ksh
# This script demonstrates the usage of the SixthSense REST API.
# Usage:
# 	create a datastream 'sound' at the endpoint
#	/bin/ksh sound.sh -c 
#
#	update the datastream with value '55.5'
#	/bin/ksh sound.sh -u 55.5
#
#	delete datastream
#	/bin/ksh sound.sh -d
#
#	update the stream in a while-true loop using ten second sleeps 
#	/bin/ksh sound.sh -l
#

socu_uri="http://localhost:8080/api/v1/"
socu_datastream_name="location"
update_interval=1

prog=${0##*/}
while getopts :cdlgu:s: c
do 	
	case $c in
		c)  create=1;;
		d)  delete=1;;
		g)  get=1;;
		u)  update=$OPTARG;;
		s)  socu_uri=$OPTARG;;
		l)  loop=1;;
		:)  print -u2 "$prog: $OPTARG requires a value"
		    exit 2;;
		\?) print -u2 "$prog: unknown option $OPTARG"
		    print -u2 "Usage: $prog [-a -b -o value] file ..."
		    exit 2;;
	esac
done
shift $((OPTIND-1))

socu_resource="${socu_uri}datastreams/$socu_datastream_name"
print "$socu_resource"

if [ "$create" == 1 ] ; then
	curl 	\
		-i \
		-X POST \
		-H "Content-Type:application/json" \
		-d @- \
		$socu_resource <<EOF
		{
			  "description": 
				"Location data."
			, "name": "location"
			, "data_fetch_method": "GET"
			, "what_to_submit": null
			, "update_interval": $(($update_interval * 100))

			, "value": null
			, "default_value": 0.0
			, "nominal_range": [0, 1]
			, "nominal_description": null
			, "recommended_nominal_mapping_range": [0, 10]
			, "recommended_stimulations": [ "vibration" ]
		} 
EOF
fi

if [ "$delete" == 1 ] ; then
	curl -i -X DELETE $socu_resource 

elif [ "$get" == 1 ] ; then
	curl -i -X GET "$socu_resource" 

elif [ "${update:-unset}" != "unset" ] ; then
	print '{ "value": ' ${update} ' }' | \
		curl \
			-i \
			-X PUT \
			-H "Content-Type:application/json" \
			-d @- "$socu_resource"

elif [ "$loop" == 1 ] ; then
	while true; do
		#filename="/tmp/record_$$.wav"
		#arecord -d 0 "$filename" &

		filename="/tmp/record_$$.raw"
		#parec -d steam.monitor > $filename &
		parec -d alsa_output.pci-0000_00_1b.0.analog-stereo.monitor > $filename &

		sleep 0.2
		kill -9 $!

		#amplitude=$(sox "$filename" -n stat 2>&1 | grep "Maximum amplitude:" | awk -F " " '{ print $3 }')

		amplitude=$(sox -c 2 -r 44100 -e signed-integer -b 16 -t raw "$filename" -n stat 2>&1 | grep "Maximum amplitude:" | awk -F " " '{ print $3 }')

		print "${amplitude} usage at $(date)\n"

		print '{ "value": ' ${amplitude} ' }' | \
			curl \
				-s \
				-X PUT \
				-H "Content-Type:application/json" \
				-d @- "$socu_resource" \
				> /dev/null
	done
fi
