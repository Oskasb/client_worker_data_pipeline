"use strict";

define([
	'data_pipeline/DataWorker'
],
	function(
		DataWorker
		) {

		var pollDelay = 0.03;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};

		var JsonPipe = function() {

		};

		JsonPipe.registerPollCallback = function(url, onUpdateCallback) {
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

		JsonPipe.storeConfig = function(url, config, success) {
			loadedData[url] = config;
			success(url, config);
		};

		JsonPipe.loadJsonFromUrl = function(url, dataUpdated, fail, activatePolling) {
			var onLoaded = function(config, fileUrl) {
					JsonPipe.storeConfig(fileUrl, config, dataUpdated);

					if (activatePolling) {
						JsonPipe.registerPollCallback(fileUrl, dataUpdated);
					}

			};

			var onWorkerOk = function(resUrl, res) {
				onLoaded(JSON.parse(res), resUrl);
				//	console.log("Worker success: ", res, activatePolling)
			};
			var onWorkerFail = function(res) {
				fail("Worker fail: "+ res)
			};

			DataWorker.fetchJsonData(url, onWorkerOk, onWorkerFail);
		};

		JsonPipe.tickJsonPipe = function(tpf) {
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					console.log("Polling failed", err);
				};
				JsonPipe.loadJsonFromUrl(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false)
				pollCountdown = pollDelay;
			}
		};

		return JsonPipe

	});