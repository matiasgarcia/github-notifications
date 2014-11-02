/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var token = "c57346bda60e7fbcd5c11a94da24aeec778eb1a1";
var notificationsEndpoint = "https://api.github.com/notifications";

/*Notification object*/
Notification = function(data) {
	
        console.log("repository: " + data.id);
        console.log("latest_comment_url: " + data.subject.latest_comment_url);
        latestComment = getLatestComment(data.subject.latest_comment_url);
         
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

function getLatestComment(url){
    
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


function populateHtml(notificationsList){

    var lastRepo = "";
    $('#content').empty();
    
    notificationsList.forEach(function(notification){
        var notificationElement = createNotificationNode(notification);

        if (lastRepo === "" || lastRepo !== notification.repository.name)
        {
            var repoTitle = $("<h4></h4>").text(notification.repository.name);   
            $('#content').append(repoTitle);
            lastRepo = notification.repository.name;
        }

        $('#content').append(notificationElement);
    });
    

}

function updateNotifications(){
    chrome.storage.sync.get(
        "github_key",
    function(items) {
        token = items.github_key;
    });
    
    var notifications = [];

    $.ajax({
            url: appendAccessToken(notificationsEndpoint, token),
            type: 'GET',
            async: true,
            cache: false,
            timeout: 2000,
            error: function(){
                alert('error loading notifications');
                //TODO: Cargar en el html el error
            },
            success: function( data ) {
                    data.forEach(function(notification){
                            notifications.push(new Notification(notification));
                    });
                    
                    populateHtml(notifications);
                    chrome.browserAction.setBadgeText("1");
            }
    });
    
}

/*Load page*/
$( document ).ready(function() {
    
    
    updateNotifications();
});

