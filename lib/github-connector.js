var notificationsEndpoint = "https://api.github.com/notifications";

/*Notification object*/
Notification = function(data, getAdditionalData) {
	
        console.log("repository: " + data.id);
        console.log("latest_comment_url: " + data.subject.latest_comment_url);
        
        
        if (getAdditionalData){
            var latestComment = getLatestComment(data.subject.latest_comment_url, data.access_token);
        }else{
            var latestComment = { state : "Issue", user : {login:"", avatar_url: ""}}; //Default
            
        }         
	this.id = data.id;
	this.updatedAt = dateDiffDynamic(new Date(),new Date(data.updated_at));
	this.subject = {
		title: data.subject.title,
		type: data.subject.type,
                state: latestComment.state,
		body: data.subject.body,
		html_url: data.subject.html_url
	};
	this.user = {
		login: latestComment.user.login,
		avatar_url: latestComment.user.avatar_url
	};
	this.repository = {
		id: data.repository.id,
		name: data.repository.name,
		full_name: data.repository.full_name
	};
        this.markAsReadUrl = data.url;
        
        console.log(this.updatedAt);
}


function appendAccessToken(endPoint, token){
	return endPoint + "?access_token=" + token;
};

function getLatestComment(url, token){
    
    var latestComment;

    $.ajax({
        url: appendAccessToken(url, token),
        type: 'GET',
        async: false,
        cache: false,
        timeout: 2000,
        error: function(){
                return true;
        },
        success: function( data ) {
            latestComment = data;
        }
    });
    
    return latestComment;
}

function getNotifications(){
    
    chrome.storage.sync.get(
        "github_key",
    function(items) {
        
        console.log('changing label');
        $('#update-now-button').text("Updating...");
        var notificationsList = [];

        $.ajax({
            url: appendAccessToken(notificationsEndpoint, items.github_key),
            type: 'GET',
            async: true,
            cache: false,
            timeout: 2000,
            error: function(a, b, c){
                
                console.log('status: ' + b.toString + ' - ' + 'error: ' + c.toString());
                //TODO: Cargar en el html el error
            },
            success: function( data ) {

                var counter = 0;
                
                data.forEach(function(notification){
                    
                    //sets access token so that the inner function can call
                    //the github api to get aditional data as required
                    notification.access_token = items.github_key;
                    
                    if (counter < notificationsLimit){
                        //console.log('pushing notification WITH additional data')
                        notificationsList.push(new Notification(notification, true));
                    }
                    else{
                        //console.log('pushing notification without additional data')
                        notificationsList.push(new Notification(notification, false));
                    }
                    counter++;

                });
                
                //caches the array so that the next time the icon is clicked
                //the data is shown without delay. Uses the local storage
                //instead of sync
                chrome.storage.local.set({
                    lastResponse: notificationsList
                }, function() {
                    //console.log(notificationsList.length + ' notifications saved');
                });
                updateUI(notificationsList);
            }
        });
        
    }); 
}

//Receives the thread URL and the ID of the notification node to hide afterwards
function markThreadAsRead(url, nodeId){

    chrome.storage.sync.get(
        "github_key",
    function(items) {
        
        $.ajax({
            url: appendAccessToken(url, items.github_key),
            type: 'PATCH',
            async: true,
            cache: false,
            timeout: 2000,
            error: function(){
                alert('Error at mark as read');
                //TODO: Cargar en el html el error
            },
            success: function( data ) {
                //console.log('hiding nodeId: ' + nodeId );
                $('#' + nodeId).toggle('fade');
                getNotifications();
            }
        });
        
    });
    
    
}