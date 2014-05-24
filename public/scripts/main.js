var currentrequest = null;

function LookName (name)
{
	console.log(name);
	
	if (currentrequest != null)
		currentrequest.abort();
	
	currentrequest = $.ajax({
		"url" : "/search/" + name,
	}).done (GetName);
}

function GetName (data)
{
	console.log(data);
	
	var source   = $("#entry-template").html();
	var template = Handlebars.compile(source);
	
	var context = {arr: data}
	var html    = template(context);
	
	$("#translations").html(html);

};

$(document).on("ready", function () {

	$("#maininput").on("keyup", function() {
		LookName($("#maininput").val());
	})
})