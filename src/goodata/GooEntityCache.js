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

		GooEntityCache.prototype.cacheLoadedEntities = function(goo, bundleConf, loaderData, loader, success, fail, notifyLoaderProgress) {
			console.log("Bundle down: ", bundleConf, loaderData, loader);

			var progressUpdate = function(handled, refCount) {
				notifyLoaderProgress(handled, refCount);
				console.log("Progress: ", handled, refCount);
			};


			var world = goo.world;

			var transformSystem = world.getSystem('TransformSystem');
			var cameraSystem = world.getSystem('CameraSystem');
			var boundingSystem = world.getSystem('BoundingUpdateSystem');
			var animationSystem = world.getSystem('AnimationSystem');
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = goo.renderer;


			for (var index in loaderData) {

				var entry = loaderData[index];
				if (bundleConf.entities.indexOf(entry.name) != -1) {

					var entityBuilt = function(res) {
						this.returnBuiltEntity(goo, res, bundleConf, success, fail);
					}.bind(this);

					this.cachedEntities[entry.name] = entry;
					loader.load(entry.id, {preloadBinaries:true, progressCallback:progressUpdate})
						.then(function(res) {

						world.processEntityChanges();
						transformSystem._process();
						cameraSystem._process();
						boundingSystem._process();
						renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights);
						renderer.preloadMaterials(renderSystem._activeEntities);
						animationSystem._process();
						renderSystem._process();

						entityBuilt(res)

					}).then(null, function (e) {
							// If something goes wrong, 'e' is the error message from the engine.
							fail('Failed to load bundle: ' + e);
						})
									}
			}
		};

		GooEntityCache.prototype.getCachedObjectByName = function(name) {

		};


		return GooEntityCache;
	});
