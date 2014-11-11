#!/bin/ksh

SOCU_URI="http://localhost:8080"
SOCU_DATASTREAM_NAME="cpu-usage-michi"
SOCU_RESOURCE="$SOCU_URI/datastreams/$SOCU_DATASTREAM_NAME"

# create datastream
curl 	\
	-v \
	-X POST \
	-H "Content-Type:application/json" \
	-d @- \
	$SOCU_RESOURCE <<EOF
	{
		"foo": true
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

