# SixthSense Service-Oriented Control Unit (SOCU)

This repository contains a reference implementation of the SixthSense REST
API, which specifies the communication of the Higher-Order Control Unit
(e.g. a Smartphone) with the Lower-Order Control Uni (e.g. an Arduino).

 * All data is in memory
 * No authorization is implemented -- Administrator party, everybody can
   read/write everything

	export SOCU_URI="http://socu.creal.de/api/v1/"
	node socu.js

	/bin/ksh cpu.sh -c -s $SOCU_URI
	/bin/ksh cpu.sh -l -s $SOCU_URI
