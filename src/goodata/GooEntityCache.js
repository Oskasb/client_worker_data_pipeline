define([
	'goo/entities/EntityUtils'

],
	function(
		EntityUtils
		) {
		"use strict";

		var goo;

		var GooEntityCache = function() {
			this.clonableEntities = {};
		    this.cachedEntities = {};
			this.cachedEnvironments = {};
		};

		GooEntityCache.prototype.preloadEntityData = function(entity, callback) {

			var world = goo.world;
			var transformSystem = world.getSystem('TransformSystem');
			var cameraSystem = world.getSystem('CameraSystem');
			var boundingSystem = world.getSystem('BoundingUpdateSystem');
			var animationSystem = world.getSystem('AnimationSystem');
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = goo.renderer;

			var processCount = 0;
			var doneCount = 0;

			var handleTraversed = function(child) {
				  if (!child.id) {
					  console.error("No id on Child: ", child)
				  }
				if (child.meshRendererComponent) {
					processCount++;
					var precompedShader = function() {
						return renderer.preloadMaterials([child]).then(preloadedMats);
					};

					var preloadedMats = function() {
						world.processEntityChanges();
						processCount--;
						if (processCount == 0) {
							doneCount++;
							callback();

						}
					};

					world.processEntityChanges();
					transformSystem._process();
					cameraSystem._process();
					boundingSystem._process();
					animationSystem._process();
					renderer.precompileShaders([child], renderSystem.lights).then(precompedShader);
				}

			};

			if (typeof(entity.traverse) == 'function') {
				entity.traverse(handleTraversed);

				if (doneCount == 0 && processCount == 0) {
					console.error("Traversed entity and found zero mesh renderer comps..", entity);
					callback();
				}
			} else {
				callback();
			}
		};

		GooEntityCache.prototype.preloadEntity = function(entity, bundleConf, sourceData, success, cloneIt) {

			var preloadDoneCallback = function(ent, gooConf, sourceConf) {
				success(ent.name, {conf:gooConf, sourceData:sourceConf, build:cloneIt})
			};

			var preProcessingDone = function() {
				this.clonableEntities[entity.name] = entity;
				preloadDoneCallback(entity, bundleConf, sourceData);
			}.bind(this);

			this.preloadEntityData(entity, preProcessingDone);
		};

		GooEntityCache.prototype.cloneEntity = function(entityName, callback) {
			if (!this.clonableEntities[entityName]) {
				console.error("No entity available with name: ", entityName, this.clonableEntities);
			}
			callback(EntityUtils.clone(goo.world, this.clonableEntities[entityName]));
		};




		GooEntityCache.prototype.reloadEnvironment = function(entityName, callback) {
			if (!this.cachedEnvironments[entityName]) {
				console.error("No environment available with name: ", entityName, this.cachedEnvironments);
			}

			this.cachedEnvironments[entityName].loader.load(this.cachedEnvironments[entityName].conf.id).then(function(res) {
				callback(res)
			});
		};


		GooEntityCache.prototype.returnBuiltEntity = function(id, entity, loader, sourceData, success, fail) {

			var cloneEntityName = function(conf, cb) {
				// make it asynch response
				setTimeout(function() {
					cb(EntityUtils.clone(goo.world, entity));
				}, 0);
			};

			var cloneIt = function(entityName, callback) {
				cloneEntityName(this.cachedEntities[entityName], callback);
			}.bind(this);

			this.preloadEntity(entity, this.cachedEntities[entity.name], sourceData, success, cloneIt)

		};

		GooEntityCache.prototype.cacheLoadedEntities = function(gooRunner, bundleConf, loaderData, loader, success, fail, notifyLoaderProgress) {
			goo = gooRunner;

			var progressUpdate = function(handled, refCount) {
				notifyLoaderProgress(handled, refCount);
			};

			for (var index in loaderData) {
				var entry = loaderData[index];

				if (bundleConf.environment) {
					if (bundleConf.environment.indexOf(entry.name) != -1) {

						this.cachedEnvironments[entry.name] = {conf:entry, loader:loader};
						loader.load(entry.id)

						console.log("Added env: ", entry.name, this.cachedEnvironments, success);
						var applyIt = function(name, cb) {
							console.log("Apply: ", this.cachedEnvironments[name]);
							cb(this.cachedEnvironments[name])
						}.bind(this);
					//	success("ok")
					//	success(entry.name, {conf:entry, sourceData:bundleConf, build:applyIt})
					}
				}

				if (bundleConf.entities) {

					if (bundleConf.entities.indexOf(entry.name) != -1) {

						var entityBuilt = function(id, res, dynamicLoader) {
							this.returnBuiltEntity(id, res, dynamicLoader, bundleConf, success, fail);
						}.bind(this);

						this.cachedEntities[entry.name] = entry;
						loader.load(entry.id, {preloadBinaries:true, progressCallback:progressUpdate})
							.then(function(res) {

								if (!entry.id) {
									console.error("No ID on entry: ", entry)
									return;
								}
								entityBuilt(entry.id, res, loader);

							}).then(null, function (e) {
								// If something goes wrong, 'e' is the error message from the engine.
								fail('Failed to load bundle: ', e);
							})
					}
				}
			}
		};

		GooEntityCache.prototype.getCachedObjectByName = function(name) {

		};


		return GooEntityCache;
	});
