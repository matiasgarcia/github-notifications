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

	return notification;
  });
};

$.ajax({
        url: notificationsEndpoint,
        type: 'GET',
        async: false,
        cache: false,
        timeout: 30000,
        error: function(){
            return true;
        },
        success: buildNotifications
    });