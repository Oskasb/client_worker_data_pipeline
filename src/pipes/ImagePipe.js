"use strict";

define([
	'data_pipeline/DataWorker'
],
	function(
		DataWorker
		) {

		var pollDelay = 1;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};

		var options = {
			"polling":{
				"enabled":true,
				"frequency":1
			}
		};


		var ImagePipe = function() {

		};

		ImagePipe.registerPollCallback = function(url, onUpdateCallback) {
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

		ImagePipe.storeData = function(url, svg, success) {
			loadedData[url] = svg;
			success(url, svg);
		};

		ImagePipe.loadImage = function(url, dataUpdated, fail) {
			var onLoaded = function(svg, fileUrl) {
				ImagePipe.storeData(fileUrl, svg, dataUpdated);
				ImagePipe.registerPollCallback(fileUrl, dataUpdated);
			};

			var onWorkerOk = function(resUrl, res) {
				console.log("Binary Data Loaded OK", resUrl, res);
				onLoaded(res, resUrl);
				//	console.log("Worker success: ", res, activatePolling)
			};
			var onWorkerFail = function(res) {
				console.log("Worker fail: ", res)
			};

			DataWorker.fetchBinaryData(url, onWorkerOk, onWorkerFail);
		};

		ImagePipe.tickImagePipe = function(tpf) {
			if (!options.polling.enabled) return;
			pollDelay = 1/options.polling.frequency;
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					console.log("Polling failed", err);
				};
				ImagePipe.loadImage(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false)
				pollCountdown = pollDelay;
			}
		};

		ImagePipe.setImagePipeOpts = function(opts) {
			options = opts;
		};

		return ImagePipe

	});