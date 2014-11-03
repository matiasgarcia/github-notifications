/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var notificationsEndpoint = "https://api.github.com/notifications";
var notificationsLimit = 5;

/*Notification object*/
Notification = function(data) {
	
        console.log("repository: " + data.id);
        console.log("latest_comment_url: " + data.subject.latest_comment_url);
        latestComment = getLatestComment(data.subject.latest_comment_url, data.access_token);
         
	this.id = data.id;
	this.updatedAt = dateDiffDynamic(new Date(),new Date(data.updated_at));
	this.subject = {
		title: data.subject.title,
		type: data.subject.type,
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
        
        console.log(this.updatedAt);
}

function appendAccessToken(endPoint, token){
	return endPoint + "?access_token=" + token;
};


//Creates the HTML notification node
function createNotificationNode(notificationData){
    
    var parentNode = $('<div class="notification"></div>');
    var headerNode = $('<div class="notification-header"></div>');
    var bodyNode = $('<div class="notification-body"></div>');
    
    var varTemp;

    varTemp = document.createElement("img");
    varTemp.setAttribute("class", "author-img");
    varTemp.setAttribute("src", notificationData.user.avatar_url);
    headerNode.append(varTemp);
    
    varTemp = document.createElement("span");
    varTemp.setAttribute("class", "author");
    varTemp.innerHTML = notificationData.user.login;
    headerNode.append(varTemp);
    
    varTemp = document.createElement("span");
    varTemp.setAttribute("class", "action");
    varTemp.innerHTML = "¿Que?";
    headerNode.append(varTemp);
    
    varTemp = document.createElement("span");
    varTemp.setAttribute("class", "octicon octicon-issue-opened status-open");
    bodyNode.append(varTemp);
    
    bodyNode.append(notificationData.subject.title);
    
    varTemp = document.createElement("span");
    varTemp.setAttribute("class", "age");
    varTemp.innerHTML = notificationData.updatedAt;
    bodyNode.append(varTemp);
    
    parentNode.append(headerNode, bodyNode);
    
    return parentNode;
}

//Dynamically return date difference in hours or days
function dateDiffDynamic(date1, date2) {

    var diff = Math.abs(date1 - date2) / 36e5;
    
    console.log(diff);

    if ((diff) <= 24){
        if (diff < 1){
            diff = "less than an hour ago";
        }
        else{
            diff = Math.floor(diff)
            if (diff > 1){
                diff = diff + " hours ago";
            }
            else{
                diff = diff + " hour ago";
            }
        }
    }
    else{
        diff = Math.floor(diff/24);
        if (diff > 1){
            diff = diff + " days ago";
        }
        else{
            diff = diff + " day ago";
        }
    }
    
    return diff;
}

//As the chrome security does not allow links on the extension to open new
//tabs directly, we have to add an event listener to perform the tab opening

function generateOpenAllNotificationsLink(){
    
    
    
}

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

function getNotificationIcon(notificationType){
    switch(notificationType){
        
    }
    
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
            error: function(){
                alert('Error loading notifications');
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

function populateHtml(notificationsList){

    var lastRepo = "";
    var counter = 0;
    
    $('#content').empty();
    
    notificationsList.forEach(function(notification){
        
        if (counter < notificationsLimit){
            var notificationElement = createNotificationNode(notification);

            if (lastRepo === "" || lastRepo !== notification.repository.name)
            {
                var repoTitle = $("<h4></h4>").text(notification.repository.name);   
                $('#content').append(repoTitle);
                lastRepo = notification.repository.name;
            }

            $('#content').append(notificationElement);
        }
        
        counter++;
    });
    
    $('#footer').empty();
    
    //checks if there are notifications not shown because of the limit. 
    //If so, message to the footer with the remaining count
    var remaining = counter - notificationsLimit;
    
    if (remaining > 0){
        varTemp = document.createElement("div");
        varTemp.setAttribute("class", "remaining-count");
        varTemp.innerHTML = "(not showing " + remaining  + " items)";
        $('#footer').append(varTemp);
    }
    
    varTemp = document.createElement("a");
    varTemp.setAttribute("id", "github-notifications-link");
    varTemp.setAttribute("href", "https://github.com/notifications");
    varTemp.setAttribute("alt", "See all notifications");
    varTemp.innerHTML = "See all notifications on Github";
    $('#footer').append(varTemp);
    
    /*document.getElementById('github-notifications-link').addEventListener('click',
        function () {
            chrome.tabs.create({active: true, url: link.href});
        }    
    );*/
    
    
    
   

}

//Updates the panel and badge based on the list of notifications returned
function updateUI(notificationsList){
    populateHtml(notificationsList);
    chrome.browserAction.setBadgeText({text: notificationsList.length.toString()});
    console.log('restoring label');
    $('#update-now-button').text("update now");
}

/*Load page*/
$( document ).ready(function() {
    
    chrome.storage.local.get(
        'lastResponse',
        function(items) {
            if (typeof items.lastResponse === 'undefined'){
                console.log('Running update. Notifications is undefined');
                getNotifications();
            }
            else{
                console.log('Populating html from cached data');
                updateUI(items.lastResponse);
            }
            
            
        }
    );
    
    document.getElementById('update-now-button').addEventListener('click',
    getNotifications);
    
});


