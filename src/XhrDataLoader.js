"use strict";

define([],
	function() {

		var sendXHR = function(packet, successCallback, failCallback) {

			var body = "";

			var request = new XMLHttpRequest();
			request.packet = packet;

			var asynch = true;
			//    if (packet.contentType == 'application/x-www-form-urlencoded') asynch = false;


			request.open(packet.type, packet.url, asynch);
			if (packet.responseType) request.responseType = packet.responseType;

			if (packet.contentType == 'application/json') {
				body = JSON.stringify(packet.body);
				request.setRequestHeader("Content-Type", packet.contentType);
			}

			if (packet.contentType == 'application/x-www-form-urlencoded') {
				body = packet.params;
				request.setRequestHeader("Content-Type", packet.contentType);

				//    request.setRequestHeader("Content-length", packet.params.length);
				//    request.setRequestHeader("Connection", "close");
			}

			if (packet.auth) request.setRequestHeader('Authorization', packet.auth.header);

			request.onreadystatechange = function() {
				if (request.readyState == 4) {

					successCallback(request.response, request.packet);
				}
			};

			request.onError = function() {
				failCallback("XHR Fail! ", request)
			};

			request.send(body);
		};


		var XhrDataLoader = function() {

		};


		XhrDataLoader.fetchJsonData = function(url, success, fail) {
			var packet = {
				responseType:'application/json',
				type:"GET",
				url:url
			};

			var checkJson = function(str, pkt) {
				var data = JSON.parse(str);
				if (typeof(data) == 'object'){
					success(data, url, pkt)
				} else {
					fail("JSON parse failed", url, pkt);
				}
			};

			sendXHR(packet, checkJson, fail);
		};

		XhrDataLoader.prototype.fetchJsonData = function(url, success, fail) {
			XhrDataLoader.fetchJsonData(url, success, fail);
		};

		return XhrDataLoader
	});