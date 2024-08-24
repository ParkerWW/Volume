//tab data
const tabs = [];

//get platform interface
let platform = chrome ? chrome : browser;


//runtime message
platform.runtime.onMessage.addListener(function(req, sender, sendRes) {
	//set object to be empty
	if (tabs[req.id] === undefined) {
		tabs[req.id] = {};
	}
	
	//disable volume if default
	if (req.volume == 100) {
		if (tabs[req.id].audioContext !== undefined) {
			tabs[req.id].audioContext.close();
		}
		if (tabs[req.id].mediaStream !== undefined) {
			tabs[req.id].mediaStream.getAudioTracks()[0].stop();
		}
		tabs[req.id] = {};
		
		return true;
	}
	
	//map volume between 0 and 1
	if (req.volume) {
		req.volume = Math.pow((req.volume / 100), 2);
	}
	
	//init api
	if (tabs[req.id].audioContext === undefined) {
		//get audio context
		tabs[req.id].audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
		platform.tabCapture.capture({ audio: true, video: false }, function(stream) {
			if (stream === null) {
				tabs[req.id].audioContext.close();
				tabs[req.id].audioContext = undefined;
				return;
			}

			//get media source, create and connect gain filter
			tabs[req.id].mediaStream = stream;
			let src = tabs[req.id].audioContext.createMediaStreamSource(tabs[req.id].mediaStream);

            tabs[req.id].gainFilter = tabs[req.id].audioContext.createGain();
			src.connect(tabs[req.id].gainFilter);
			tabs[req.id].gainFilter.connect(tabs[req.id].audioContext.destination);

			//apply filters
			if (req.volume) {
				tabs[req.id].gainFilter.gain.value = req.volume;
			}
		});
	}

	//if volume and stream are there
	if (req.volume !== undefined && tabs[req.id].mediaStream !== undefined) {
		tabs[req.id].gainFilter.gain.value = req.volume;
	}
	
	return true;
});