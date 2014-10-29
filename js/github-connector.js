var token = "";
var access_token_param = "?access_token="+token;
var notificationsEndpoint = "https://api.github.com/notifications"+access_token_param;

var buildNotifications = function( data ) {
	data.map(function(notifications){
		var repository = notifications.repository;
		var	subjectEndpoint = notifications.subject.url + access_token_param;
		var subject = undefined;

		$.ajax({
			url: subjectEndpoint,
			type: 'GET',
			async: false,
			success: function(data){
				subject = data;
			}
		});

		if (subject){
			notification = {
				id: notifications.id,
				updated_at: new Date(notifications.updated_at),
				subject: {
					title: subject.title,
					type: notifications.subject.type,
					body: subject.body,
					html_url: subject.html_url
				},
				user: {
					login: subject.user.login,
					avatar_url: subject.user.avatar_url
				},
				repository: {
					id: repository.id,
					name: repository.name,
					full_name: repository.full_name
				},
			};

			var view = '<div class="notification"><div class="notification-header"><img class="author-img" src="'+notification.user.avatar_url+'"><span class="author">'+notification.user.login+'</span><span class="action">'+notification.subject.type+'<span></div><div class="notification-body"><span class="octicon octicon-issue-opened status-open"></span>'+notification.subject.body+'<span class="age">hace X tiempo</span></div></div>';

			$("#container").append(view);
		}
	});
};

$( document ).ready(function() {
	$.ajax({
		url: notificationsEndpoint,
		type: 'GET',
		async: false,
		cache: false,
		timeout: 2000,
		error: function(){
			return true;
		},
		success: buildNotifications
	});
});