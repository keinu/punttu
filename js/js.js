"use strict";

var domain = (function(el) {

	var xhr;
	var placeholder = $("#results");

	var isValid = function(domain) {

		return !! domain.match(/[a-z0-9\-]/);

	}

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

		xhr = $.getJSON("http://www.mukuzu.com/domain/check/" + domain).done(function(data){

			var source  = $("#tpl").html();
			var template = Handlebars.compile(source);
			placeholder.html(template(data));
			placeholder.removeClass("loading");
			el.removeClass("loading");

		})

	}

	el.on("input", function() {

		check(el.val());

	})

})($("#domain"));