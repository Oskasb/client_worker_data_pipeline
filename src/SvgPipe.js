"use strict";

define([
	'io/pipeline/DataWorker'
],
	function(
		DataWorker
		) {

		var pollDelay = 300;
		var pollCountdown = pollDelay;
		var loadedData = {};
		var lastPolledIndex = 0;
		var pollIndex = [];
		var pollCallbacks = {};

		var SvgPipe = function() {

		};

		SvgPipe.registerPollCallback = function(url, onUpdateCallback) {
			pollCallbacks[url] = onUpdateCallback;
			pollIndex.push(url);
		};

		SvgPipe.storeData = function(url, svg, success) {
			loadedData[url] = svg;
			success(url, svg);
		};

		SvgPipe.loadSvg = function(url, dataUpdated, fail, activatePolling) {
			var onLoaded = function(svg, fileUrl) {
				SvgPipe.storeData(fileUrl, svg, dataUpdated);

				if (activatePolling) {
					SvgPipe.registerPollCallback(fileUrl, dataUpdated);
				}
			};

			var onWorkerOk = function(resUrl, res) {
				onLoaded(res, resUrl);
				//	console.log("Worker success: ", res, activatePolling)
			};
			var onWorkerFail = function(res) {
				console.log("Worker fail: ", res)
			};

			DataWorker.fetchSvgData(url, onWorkerOk, onWorkerFail);
		};

		SvgPipe.tickSvgPipe = function(tpf) {
			pollCountdown -= pollIndex.length*tpf/(pollIndex.length+1);
			if (pollCountdown < 0) {
				lastPolledIndex += 1;
				if (lastPolledIndex >= pollIndex.length) {
					lastPolledIndex = 0;
				}
				var pollFail = function(err) {
					console.log("Polling failed", err);
				};
				SvgPipe.loadSvg(pollIndex[lastPolledIndex], pollCallbacks[pollIndex[lastPolledIndex]], pollFail, false)
				pollCountdown = pollDelay;
			}
		};

		return SvgPipe

	});