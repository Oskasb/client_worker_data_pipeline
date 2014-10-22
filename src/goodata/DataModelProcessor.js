define([
],
/** @lends  */
function(
){

	/**
	 * @class
	 */
	function DataModelProcessor(){

	}

	/**
	 * Processes the Goo datamodel JSON structure before loading it into the loader. Note that the JSON object will be mutated.
	 * @param  {object} json
	 * @return {object}
	 */
	DataModelProcessor.process = function(json){
		return json;
	};

	DataModelProcessor.processColliders = function(json){

		/*
		if(!ctx.entity.cannonRigidbodyComponent && goo.CannonRigidbodyComponent && !ctx.world.getSystem('CannonSystem').passive){
			var addedComponent = false;
			ctx.entity.traverse(function(descendant){
				if((descendant.hasTag('collider') || descendant.hasTag('trigger')) && descendant.hasComponent('MeshDataComponent')){
					var md = descendant.meshDataComponent.meshData;
					var scale = descendant.transformComponent.worldTransform.scale.data;
					var collider;
					if(md instanceof goo.Sphere){
						collider = new goo.CannonSphereColliderComponent({radius: md.radius * scale[0]});
					} else if(md instanceof goo.Box){
						collider = new goo.CannonBoxColliderComponent({
							halfExtents: new goo.Vector3(
								md.xExtent * scale[0],
								md.yExtent * scale[1],
								md.zExtent * scale[2]
							)
						});
					} else if(md instanceof goo.Cylinder){
						// The goo & cannon cylinders are both along Z. Nice!
						collider = new goo.CannonCylinderColliderComponent({
							radiusTop: md.radiusTop * scale[0],
							radiusBottom: md.radiusBottom * scale[0],
							height: md.height * scale[2],
							numSegments: md.radialSamples
						});
					} else if(md instanceof goo.Quad){
						collider = new goo.CannonPlaneColliderComponent();
					} else {
						console.error('Unknown collider shape');
						console.error(md);
						return;
					}
					descendant.setComponent(collider);
					if(descendant.hasTag('trigger'))
						collider.isTrigger = true;
					addedComponent = true;
				}
			});
			if(addedComponent){
				ctx.entity.setComponent(new goo.CannonRigidbodyComponent({
					mass: args.mass
				}));
				ctx.bodyStep = 0;
			}
		}
		*/


		return json;
	};

	return DataModelProcessor;
});