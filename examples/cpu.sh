#!/bin/ksh
# This script demonstrates the usage of the SixthSense REST API.
# Usage:
# 	create a datastream 'cpu-usage-example' at the endpoint
#	/bin/ksh cpu.sh -c 
#
#	update the datastream with value '55.5'
#	/bin/ksh cpu.sh -u 55.5
#
#	delete datastream
#	/bin/ksh cpu.sh -d
#
#	update the stream in a while-true loop using 1sec sleeps
#	/bin/ksh cpu.sh -l

socu_uri="http://localhost:8080"
socu_datastream_name="cpu-usage-example"
socu_resource="$socu_uri/datastreams/$socu_datastream_name"
update_interval=1

prog=${0##*/}
while getopts :cdlgu: c
do 	
	case $c in
		c)  create=1;;
		d)  delete=1;;
		g)  get=1;;
		u)  update=$OPTARG;;
		l)  loop=1;;
		:)  print -u2 "$prog: $OPTARG requires a value"
		    exit 2;;
		\?) print -u2 "$prog: unknown option $OPTARG"
		    print -u2 "Usage: $prog [-a -b -o value] file ..."
		    exit 2;;
	esac
done
shift $((OPTIND-1))

if [ "$create" == 1 ] ; then
	curl 	\
		-i \
		-X POST \
		-H "Content-Type:application/json" \
		-d @- \
		$socu_resource <<EOF
		{
			  "value": null
			, "data_fetch_method": "GET"
			, "update_interval": $(($update_interval * 1000))
			, "nominal_range": [0, 100]
			, "nominal_type": "float"
			, "description": "CPU usage, Michi"
			, "recommended_nominal_mapping_range": [0, 10]
			, "recommended_stimulation": "vibration"
			, "default_value": 0.0
		} 
EOF
fi

if [ "$delete" == 1 ] ; then
	curl -X DELETE $socu_resource 
fi

if [ "$get" == 1 ] ; then
	curl -X GET $socu_resource | python -mjson.tool
fi

if [ "${update:-unset}" != "unset" ] ; then
	print "updating"
	print '{ "value": ' ${update} ' }' | \
	curl \
		-i \
		-X PUT \
		-H "Content-Type:application/json" \
		-d @- "$socu_resource"
fi

if [ "$loop" == 1 ] ; then
	while true; do
		sleep 1;
		cpu_usage=$( top -b -n1 | grep "Cpu(s)" | awk '{print $2 + $4}' )
		d=$(date)
		print "${cpu_usage} usage at ${d}\n"

		print '{ "value": ' ${cpu_usage} ' }' | \
		curl \
			-X PUT \
			-H "Content-Type:application/json" \
			-d @- "$socu_resource"  
	done
fi
