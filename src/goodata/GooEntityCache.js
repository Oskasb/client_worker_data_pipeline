define([
	'goo/entities/EntityUtils'

],
	function(
		EntityUtils
		) {
		"use strict";

		var GooEntityCache = function() {
		    this.cachedEntities = {};
		};


		GooEntityCache.prototype.returnBuiltEntity = function(goo, entity, bundleConf, success, fail) {

			var cloneIt = function() {
				return EntityUtils.clone(goo.world, entity, {});
			};


			console.log("Wanted entity cached: ", entity);
			success(entity.name, {conf:this.cachedEntities[entity.name], sourceData:bundleConf, build:cloneIt})

		};

		GooEntityCache.prototype.cacheLoadedEntities = function(goo, bundleConf, loaderData, loader, success, fail) {
			console.log("Bundle down: ", bundleConf, loaderData, loader);

			var progressUpdate = function(handled, refCount) {
				console.log("Progress: ", handled, refCount);
			};

			for (var index in loaderData) {




				var entry = loaderData[index];
				if (bundleConf.entities.indexOf(entry.name) != -1) {

					var entityBuilt = function(res) {
						this.returnBuiltEntity(goo, res, bundleConf, success, fail);
					}.bind(this);

					this.cachedEntities[entry.name] = entry;
					loader.load(entry.id, {preloadBinaries:true, progressCallback:progressUpdate}).then(entityBuilt);
				}
			}
		};

		GooEntityCache.prototype.getCachedObjectByName = function(name) {

		};


		return GooEntityCache;
	});
