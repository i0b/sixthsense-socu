#!/bin/ksh
# Usage: ./cpu-usage.sh {create|delete|update} 

SOCU_URI="http://localhost:8080"
SOCU_DATASTREAM_NAME="cpu-usage-michi"
SOCU_RESOURCE="$SOCU_URI/datastreams/$SOCU_DATASTREAM_NAME"
UPDATE_INTERVAL=1

# create datastream
curl 	\
	-v \
	-X POST \
	-H "Content-Type:application/json" \
	-d @- \
	$SOCU_RESOURCE <<EOF
	{
		  "value": 0.0
		, "data_fetch_method": "GET"
		, "update_interval": $(($UPDATE_INTERVAL * 1000))
		, "nominal_range": [0, 100]
		, "nominal_type": "float"
		, "description": "CPU usage, Michi"
	} 
EOF

exit 0

while true; do
	CPU_USAGE=`top -b -n1 | grep "Cpu(s)" | awk '{print $2 + $4}'`
	echo "{ type: 'pull', value: '$CPU_USAGE' }" | \  
	curl \
		-v -X PUT \
		-d @- "$SOCU_RESOURCE" \ 
		--header "Content-Type:application/json"
	sleep 1;
done

