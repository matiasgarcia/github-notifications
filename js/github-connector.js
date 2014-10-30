var token = "";
var notificationsEndpoint = "https://api.github.com/notifications";

function appendAccessToken(endPoint, token){
	return endPoint + "?access_token=" + token;
};

/*Notification object*/
Notification = function(data) {
	repository = data.repository;
	subjectEndpoint = data.subject.url;
	subject = undefined;

	$.ajax({
		url: appendAccessToken(subjectEndpoint, token),
		type: 'GET',
		async: false,
		success: function(data){
			subject = data;
		}
	});

	this.id = data.id;
	this.updatedAt = new Date() - new Date(data.updated_at)
	this.subject = {
		title: subject.title,
		type: data.subject.type,
		body: subject.body,
		html_url: subject.html_url
	};
	this.user = {
		login: subject.user.login,
		avatar_url: subject.user.avatar_url
	};
	this.repository = {
		id: repository.id,
		name: repository.name,
		full_name: repository.full_name
	};
}

/*Load page*/
$( document ).ready(function() {
	var viewModel = {
		notifications: []
	};

	$.ajax({
		url: appendAccessToken(notificationsEndpoint, token),
		type: 'GET',
		async: false,
		cache: false,
		timeout: 2000,
		error: function(){
			return true;
		},
		success: function( data ) {
			data.forEach(function(notification){
				viewModel.notifications.push(new Notification(notification));
			});
		}
	});

    ko.applyBindings(viewModel);
});