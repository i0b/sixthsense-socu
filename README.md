# SixthSense Service-Oriented Control Unit (SOCU)

This repository contains a reference implementation of the SixthSense REST
API, which specifies the communication of the Higher-Order Control Unit
(e.g. a Smartphone) with the Lower-Order Control Uni (e.g. an Arduino).

It currently has those limitations:

 * All data is in memory
 * No authorization is configured -- Administrator party, everybody can
   read/write everything. If you need support for authorization you should 
   use the HTTP mechanisms to configure authorization for certain
   URI path-segments.

Here is an example of how to start the SOCU:

	export SOCU_URI="http://socu.creal.de/api/v1/"
	node socu.js

In a separate Shell session:

	SOCU_URI="http://socu.creal.de/api/v1/"
	/bin/ksh cpu.sh -c -s $SOCU_URI # this creates a datastream
	/bin/ksh cpu.sh -l -s $SOCU_URI # this updates the datastream in a loop

Other options:

	/bin/ksh cpu.sh -u 1 -s $SOCU_URI # update datastream to value '1'
	/bin/ksh cpu.sh -d -s $SOCU_URI # delete datastream 

There are more options (update to a value, delete a datastream, etc.)
available. There are also more examples within the `examples/` folder.


## How to get the sound example working

Do you want to use the Internal Microphone of your Laptop? Then make sure
no sound is playing and (in pavucontrol) that it gets enough input.

Or do you want to use a song played by some application? In this case you
should turn the Internal Microphone down to 0% (in pavucontrol). Then 

	pacmd
	list-sink-inputs

Look for a line similar to `sink: 0 <alsa_output.pci-0000_00_1b.0.analog-stereo>`.

	parec -d alsa_output.pci-0000_00_1b.0.analog-stereo.monitor > /tmp/raw.raw


## ToDos

 * add field `timeout_if_last_updated_longer_ago_than`


## License

The project is licensed under the MIT license:

	Copyright (c) 2014-2015

		Leo Hnatek
		Sabine Wieluch
		Michael Mueller 

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
