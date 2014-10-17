"use strict";

define([
	'data_pipeline/DataWorker'
],
	function(
		DataWorker
		) {

		var pollDelay = 0.2;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};

		var options = {
			"polling":{
				"enabled":true,
				"frequency":5
			}
		};

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

		JsonPipe.loadJsonFromUrl = function(url, dataUpdated, fail) {
			var onLoaded = function(config, fileUrl) {
				JsonPipe.storeConfig(fileUrl, config, dataUpdated);
				JsonPipe.registerPollCallback(fileUrl, dataUpdated);
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
				JsonPipe.loadJsonFromUrl(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false)
				pollCountdown = pollDelay;
			}
		};

		JsonPipe.setJsonPipeOpts = function(opts) {
			options = opts;
		};

		return JsonPipe

	});