"use strict";

define([
	'data_pipeline/worker/WorkerJsonValidator',
	'data_pipeline/goodata/DataModelProcessor'
],
	function(
		WorkerJsonValidator,
		DataModelProcessor
		) {

		var cachedJson = {};
		var cachedSvg = {};
		var cachedBinary = {};
		var errorUrls = {};

		var DataComparator = function() {
			this.jsonValidator = new WorkerJsonValidator();
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

					// Process data model
					validJson = DataModelProcessor.process(validJson);

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

			var success = function(srcUrl, data) {
				responseOk(srcUrl, data)
			};


			var checkArraySame = function(a1, a2) {
				if (!a1) return false;
				if (a1.length != a2.length) return false;

				for (var i = 0; i < a1.length; i++) {
					if (a1[i] != a2[i]) return false
				}
				return true;
			};

			if (checkArraySame(cachedBinary[url], binData)) {
				if (errorUrls[url]) {
					errorResolved(url, errorUrls[url])
				}
			} else {
				cachedBinary[url] = binData;
				success(url, binData);
			}
		};


		return DataComparator;

	});