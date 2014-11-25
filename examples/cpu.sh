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
#	update the stream in a while-true loop using ten second sleeps 
#	/bin/ksh cpu.sh -l

socu_uri="http://localhost:8080/api/v1/"
socu_datastream_name="cpu-usage-example"
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
				"Demo CPU usage, updated each ten seconds."
			, "name": "cpu-usage"
			, "data_fetch_method": "GET"
			, "what_to_submit": null
			, "update_interval": $(($update_interval * 1000))

			, "value": null
			, "default_value": 0.0
			, "nominal_range": [0, 100]
			, "nominal_description": "%"
			, "recommended_nominal_mapping_range": [0, 10]
			, "recommended_stimulations": [ "vibration", "thermal" ]
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
		if [ "$(uname)" == "OpenBSD" ] ; then
			cpu_usage=$( top -n1 | grep "CPUs" | awk '{ print $3+$5+$7+$9 }' )
		else
			cpu_usage=$( top -b -n1 | grep "Cpu(s)" | awk '{print $2 + $4}' )
		fi

		print "${cpu_usage} usage at $(date)\n"

		print '{ "value": ' ${cpu_usage} ' }' | \
			curl \
				-s \
				-X PUT \
				-H "Content-Type:application/json" \
				-d @- "$socu_resource" \
				> /dev/null
		sleep 10;
	done
fi
