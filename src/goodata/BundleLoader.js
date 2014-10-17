define([
		'goo/loaders/DynamicLoader'
	],
	function(
		DynamicLoader
		) {
		"use strict";

		var goo;

		function loadFromUrl(refFile, fileName, success, fail) {

			var loader = new DynamicLoader({
				world: goo.world,
				//    preloadBinaries: true,
				rootPath: refFile,
				beforeAdd:function(){return false} // return false to prevent auto-add to world
			});

			loader.load(fileName).then(function(data) {
				success(refFile, data, loader)
			}).then(null, function(error) {
				fail(loader, error);
			});
		}

		function loadBundleData(g00, url, fileName, success, fail) {
			goo = g00;
			loadFromUrl(url, fileName, success, fail)
		}

		return {
			loadBundleData:loadBundleData
		}
	});
