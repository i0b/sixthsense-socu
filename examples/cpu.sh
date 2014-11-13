#!/bin/ksh
# Usage: ./cpu-usage.sh {create|delete|update} 

socu_uri="http://localhost:8080"
socu_datastream_name="cpu-usage-michi"
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
	print "creating resource"
	curl 	\
		-v \
		-X POST \
		-H "Content-Type:application/json" \
		-d @- \
		$socu_resource <<EOF
		{
			  "value": 0.0
			, "data_fetch_method": "GET"
			, "update_interval": $(($update_interval * 1000))
			, "nominal_range": [0, 100]
			, "nominal_type": "float"
			, "description": "CPU usage, Michi"
			, "recommended_nominal_mapping_range": [0, 10]
			, "recommended_stimulation": "vibration"
		} 
EOF
fi

if [ "$delete" == 1 ] ; then
	print "deleting resource"
	curl -v -X DELETE $socu_resource 
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
