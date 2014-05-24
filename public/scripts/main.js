var currentrequestT = null;
var currentrequestA = null;

function LookName (name)
{
	if (currentrequestT != null)
		clearTimeout(currentrequestT);
	
	currentrequestT = setTimeout(function () {
		ContinueLookup(name);
	}, 200);
}

function ContinueLookup (name)
{
	console.log(name);
	
	if (currentrequestA)
		currentrequestA.abort();
	
	currentrequestA = $.ajax({
		"url" : "/search/" + name,
	}).done (GetName);
	
	$.cookie("LastSearch", name);
}

function GetName (data)
{
	var source   = $("#entry-template").html();
	var template = Handlebars.compile(source);
	
	data.map(function(el, i) {
		if (!el["title"])
			return;
	
		ptrn = el["title"].match(/(.*) – ([^–]*)/);
		
		if (ptrn)
		{
			el["title"] = ptrn[1];
			el["languLong"] = ptrn[2];
		}
	})
	
	var context = {arr: data}
	var html    = template(context);
	
	$("#translations").html(html);

};

$(document).on("ready", function () {

	$("#maininput").on("keyup", function() {
		LookName($("#maininput").val());
	})
	
	if ($.cookie("LastSearch"))
	{
		$("#maininput").val($.cookie("LastSearch"));
		ContinueLookup($.cookie("LastSearch"));
	}
})