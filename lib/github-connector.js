var notificationsEndpoint = "https://api.github.com/notifications";

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
        $('#update-now-button').text("Loading...");
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

                data.forEach(function(notification){
                    
                    //sets access token so that the inner function can call
                    //the github api to get aditional data as required
                    
                    notification.access_token = items.github_key;
                    notificationsList.push(new Notification(notification));

                    //caches the array so that the next time the icon is clicked
                    //the data is shown without delay. Uses the local storage
                    //instead of sync
                    chrome.storage.local.set({
                        lastResponse: notificationsList
                    }, function() {
                        console.log('notifications saved');
                    });

                });
                updateUI(notificationsList);
            }
        });
        
    }); 
}

//Receives the thread URL and the ID of the notification node to hide afterwards
function markThreadAsRead(url, nodeId){
    
    console.log('marking thread as read: ' + url);
    console.log('hiding nodeId: ' + nodeId );
    $('#' + nodeId).toggle('fade');
    getNotifications();
    /*
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
                $(nodeId).toggle('fade');
                getNotifications();
            }
        });
        
    });
    */
    
}