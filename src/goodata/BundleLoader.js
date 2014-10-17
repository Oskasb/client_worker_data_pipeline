define([
		'goo/loaders/DynamicLoader'
	],
	function(
		DynamicLoader
		) {
		"use strict";

		var loaders = {};

		function loadFromUrl(goo, refFile, fileName, success, fail) {

			var loader = new DynamicLoader({
				world: goo.world,
				//    preloadBinaries: true,
				rootPath: refFile,
				beforeAdd:function(){return false} // return false to prevent auto-add to world
			});

			loader.load(fileName).then(function(data) {
				success(refFile, data, loader)
			}).then(null, function(error) {
				fail([refFile, fileName, error, loader]);
			});
		}

		function loadBundleData(goo, url, fileName, success, fail) {
			loadFromUrl(goo, url, fileName, success, fail)
		}

		return {
			loadBundleData:loadBundleData
		}
	});
