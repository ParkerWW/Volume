//get platform interface
let platform = chrome ? chrome : browser;

//setup
document.addEventListener('DOMContentLoaded', function() {
	platform.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //get the input fields
		let inp = document.getElementById('interface').children;
        
		//get the url
		let url = tabs[0].url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];

		//input change event
		for (let i = 0; i < inp.length; i++) {
			inp[i].addEventListener('change', function() {
				//set the value to 2nd input field
				for (let j = 0; j < inp.length; j++) {
					if (inp[j] === this) {
						continue;
					}
					inp[j].value = this.value;
				}
				
				//set the volume level of the tab
				platform.runtime.sendMessage({ id: tabs[0].id, volume: this.value });

				//store value
				let items = {};
				items[url] = this.value;
				platform.storage.sync.set(items);
			});
		}

		//button click event
		document.getElementById('stop').addEventListener('click', function() {
			//set the volume to 100 to disable it
			platform.runtime.sendMessage( {id: tabs[0].id, volume: 100 });
			window.close();
		});
		
		//get the volume level from storage
		platform.storage.sync.get(url, function(items) {
			//apply the volume level
			let volume = items[url];
			if (volume) {
				platform.runtime.sendMessage({ id: tabs[0].id, volume: volume });
			}
			//if no volume level given set to 100
			else {
				volume = 100;
			}
			
			//apply the volume to the interface
			for (let k = 0; k < inp.length; k++) {
				inp[k].value = volume;
			}
		});
	});
});