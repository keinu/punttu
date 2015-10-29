var domain = (function(el) {

	"use strict";

	var xhr;
	var placeholder = $("#results");

	var isValid = function(domain) {

		return !! domain.match(/[a-z0-9\-]/);

	};

	var check = function(domain) {

		if (domain.length < 4)
			return;

		if (!placeholder.hasClass("loading")) {
			placeholder.addClass("loading");
			el.addClass("loading");
		}

		if (xhr)
			xhr.abort();

		if (!isValid(domain))
			return;

		xhr = $.getJSON("https://iacicc2lpb.execute-api.eu-west-1.amazonaws.com/production?domain=" + domain).done(function(data){

			console.log(data);

			var source  = $("#tpl").html();
			var template = Handlebars.compile(source);
			placeholder.html(template(data));
			placeholder.removeClass("loading");
			el.removeClass("loading");

		});

	};

	el.on("input", function() {

		check(el.val());

	});

})($("#domain"));
