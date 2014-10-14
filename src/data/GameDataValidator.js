"use strict";

define(['io/pipeline/data/ConfigCache',
	'io/pipeline/DataPipelineMessageHandler'],
	function(
		ConfigCache,
		DataPipelineMessageHandler
		) {

		var validList = ["Update Ok:"];

		var GameDataValidator = function() {

		};

		GameDataValidator.validationError = function(msg) {
			DataPipelineMessageHandler.handleValidationError(msg)
		};

		GameDataValidator.validationPassed = function(msg) {
			DataPipelineMessageHandler.handleValidationPass(msg);
			validList = ["Update Ok:"];
		};

		var typeMap
		GameDataValidator.runTypeCheck = function(file, dataName, data, next, fail) {
			next();
			return
			if (data.files)
			// = ConfigCache.getConfigKey('validation', 'type_list');
			if (data.type_list) {
				typeMap = data.type_list;
			}



			var matchKeyValue = function(key, fail) {
				var index = typeMap.indexOf(key);
				var mappedType = typeMap[index];
				if (mappedType.indexOf(key) != -1) return;
				fail(["TypeCheck fail: >"+key+"< not "+typeof(key), dataName, file]);
			};

			var processLevel = function(data){
				for (var index in data) {
					if (!data[index]) matchKeyValue(index);
					else {
					//	matchKeyValue(data[index]);
						processLevel(data[index]);
					}
				}
			};

			processLevel(data);
			next();
		};

		GameDataValidator.checkRequiredKeys = function(file, dataName, data, next, fail) {
			var objectsToCheck = ConfigCache.getConfigKey('validation', dataName).required_objects;

			for (var index in objectsToCheck) {
				for (var key in data) {
					var entry = data[key];
					if (!entry[index]) {
						fail(["Required property missing: ", key, index, dataName, file]);
						return;
					}
					for (var i = 0; i < objectsToCheck[index].length; i++) {

						if (!entry[index][objectsToCheck[index][i]]) {
							fail(["Required value missing: ", objectsToCheck[index][i], key, index, dataName, file]);
						} else {
							console.log(index, entry, objectsToCheck[index][i], objectsToCheck[index][i])
						}
					}
				}
			}
			next();
		};

		GameDataValidator.checkOptionalKeys = function(file, dataName, data, next, fail) {
			var objectsToCheck = ConfigCache.getConfigKey('validation', dataName).optional_objects;

			for (var index in objectsToCheck) {
				for (var key in data) {
					var entry = data[key];
					if (entry) {
						for (var prop in objectsToCheck[index]) {
							if (!entry[prop]) {
								fail(["Object missing: ", prop, index,key,  dataName, file]);
							}
							for (var i = 0; i < objectsToCheck[index][prop].length; i++) {
								if (!entry[prop][objectsToCheck[index][prop][i]]) {
									fail(["Optional value missing: ", objectsToCheck[index][prop][i], key, index, prop, dataName, file]);
								} else {
									console.log(index, entry, prop, objectsToCheck[index][prop][i])
								}
							}

						}
					}
				}
			}
			next();
		};

		GameDataValidator.processData = function(file, dataName, data, ok, fail) {

			var success = function() {
				ok(file, dataName);
			};

			var typeCheck = function() {
				GameDataValidator.runTypeCheck(file, dataName, data, success, fail);
			};

			var nextCheck = function() {
				GameDataValidator.checkOptionalKeys(file, dataName, data, typeCheck, fail);
			};

			GameDataValidator.checkRequiredKeys(file, dataName, data, nextCheck, fail);
		};

		GameDataValidator.validateDataEntry = function(file, dataName, data) {

			var ok = function(url, dataType) {
				var msg = url+'  ||->  '+dataType;
				if (validList.indexOf(msg) == -1) {
					validList.push(msg);
				}

				GameDataValidator.validationPassed(validList);
			};

			var fail = function(err) {
				GameDataValidator.validationError(err);
			};

			GameDataValidator.processData(file, dataName, data, ok, fail);

		};

		GameDataValidator.validateConfig = function(file, config) {

			if (!config.length) {
				console.log("Invalid config -> Not array:", config);
				return false;
			}

			for (var i = 0; i < config.length; i++) {
				for (var dataName in config[i]) {
					GameDataValidator.validateDataEntry(file, dataName, config[i][dataName]);
				}
			}

			return true;
		};


		return GameDataValidator

	});