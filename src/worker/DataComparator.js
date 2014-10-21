"use strict";

define([
	'data_pipeline/worker/WorkerJsonValidator'
],
	function(
		WorkerJsonValidator
		) {

		var cachedJson = {};
		var cachedSvg = {};
		var cachedBinary = {};
		var errorUrls = {};

		var DataComparator = function() {
			this.jsonValidator = new WorkerJsonValidator();
			console.log("Worker DataComparator init")

		};

		var errorResolved = function(url, resolved) {
			postMessage(['error_resolved', 'Resolved Error:', resolved]);
			delete errorUrls[url];
		};

		var responseOk = function(url, data) {
			postMessage(['ok', url, data]);
		};

		var responseFail = function(url, err) {
			if (errorUrls[url]) {
				if (errorUrls[url] == err) {
					postMessage(['error_unchanged', 'Unchanged Error:', err])
				} else {
					postMessage(['error_changed', 'Error Changed:', errorUrls[url]])
				}
			}
			errorUrls[url] = err;
			postMessage(['fail', url, err])
		};


		DataComparator.prototype.compareAndCacheJson = function(url, json, dataLoader) {

			if (cachedJson[url] == json) {
				// already got this one okayed
				return;
			}

			var success = function(json) {
				responseOk(url, json)
			};

			var fail = function(err) {
				responseFail(url, err)
			};

			var isValid = function(validJson) {
				if (cachedJson[url] != validJson) {
					cachedJson[url] = validJson;
					success(validJson)
				} else {
					if (errorUrls[url]) {
						errorResolved(url, errorUrls[url])
					}
				}
			};

			this.jsonValidator.validateDataAsJson(dataLoader, url, json, isValid, fail)

		};



		DataComparator.prototype.compareAndCacheSvg = function(url, svg) {

			var success = function(json) {
				responseOk(url, json)
			};


			if (cachedSvg[url] != svg) {
				cachedSvg[url] = svg;
				success(svg);
			} else {
				if (errorUrls[url]) {
					errorResolved(url, errorUrls[url])
				}
			}
		};


		DataComparator.prototype.compareAndCacheBinary = function(url, binData) {

			var success = function(data) {
				responseOk(url, data)
			};


			if (cachedBinary[binData] != binData) {
				cachedBinary[url] = binData;
				success(binData);
			} else {
				if (errorUrls[url]) {
					errorResolved(url, errorUrls[url])
				}
			}
		};


		return DataComparator;

	});