/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var notificationsLimit = 5;

/*Notification object*/
Notification = function(data) {
	
        console.log("repository: " + data.id);
        console.log("latest_comment_url: " + data.subject.latest_comment_url);
        var latestComment = getLatestComment(data.subject.latest_comment_url, data.access_token);
         
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

function activateToggleOnMarkAsRead(){
    //console.log("Activating toggle mark as read");
    //Activate the hover effect on the mark as read button
    $('.mark-as-read').hover(function () {
        $(this).removeClass('.octicon-primitive-dot');
        $(this).addClass('octicon-x');

    }, function () {
        $(this).removeClass('octicon-x');
        $(this).addClass('.octicon-primitive-dot');
    });
}

//Creates the HTML notification node
function createNotificationNode(notificationData){
    
    var parentNode = $('<div class="notification"></div>');
    var headerNode = $('<div class="notification-header"></div>');
    var bodyNode = $('<div class="notification-body"></div>');
    
    //Sets the ID of the notification div as the notification ID 
    //so that the "mark as read" action can hide it
    
    parentNode.attr("id", 'notif-' + notificationData.id.toString());
    
    var varTemp;

    //Avatar
    varTemp = document.createElement("img");
    varTemp.setAttribute("class", "author-img");
    varTemp.setAttribute("src", notificationData.user.avatar_url);
    headerNode.append(varTemp);
    
    //Author
    varTemp = document.createElement("span");
    varTemp.setAttribute("class", "author");
    varTemp.innerHTML = notificationData.user.login;
    headerNode.append(varTemp);
    
    //Mark as read button
    varTemp = document.createElement("span");
    varTemp.setAttribute("class", "mark-as-read octicon octicon-primitive-dot");
    varTemp.setAttribute("alt", "mark as read");
    varTemp.setAttribute("title", "mark as read");
    varTemp.addEventListener("click", function(){
            markThreadAsRead(notificationData.markAsReadUrl, 'notif-' + notificationData.id);}, false);
    headerNode.append(varTemp);
    
    //Notification icon and color
    bodyNode.append(getNotificationIcon(notificationData.subject.type, notificationData.subject.state));
    
    //Notification title
    bodyNode.append(" " + notificationData.subject.title);
    
    //Notification Age
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


function getNotificationIcon(notificationType, state){
    var varTemp = document.createElement("span");
    console.log('selecting notification icon: ' + notificationType);
    
    var statusTemp = "";
    switch(state){
        case 'closed':
            {
                statusTemp = "status-closed";
                break;
            }
        case 'open':
            {
                statusTemp = "status-open";
                break;
            }
        default:
            {
                statusTemp = "status-merged";
            }
            
    }
    switch(notificationType){
        case 'Commit':
        {
            varTemp.setAttribute("class", "octicon octicon-git-commit " + statusTemp);
            break;
        }
        case 'Issue':
        {
            varTemp.setAttribute("class", "octicon octicon-issue-opened " + statusTemp);
            break;
        }
        case 'PullRequest':
        {
            varTemp.setAttribute("class", "octicon octicon-git-pull-request " + statusTemp);
            break;
        }
        default:
        {
            varTemp.setAttribute("class", "octicon octicon-issue-opened " + statusTemp);
        }
    }
    
    return varTemp;
}

function populateHtml(notificationsList){

    var lastRepo = "";
    var counter = 0;
    
    $('#content').empty();
    $('#footer').empty();
    
    if (notificationsList.length > 0){
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
        
        activateToggleOnMarkAsRead();
        $('#footer').empty();
    
        //checks if there are notifications not shown because of the limit. 
        //If so, message to the footer with the remaining count
        var remaining = counter - notificationsLimit;

        var varTemp;
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
    else{
        $('#content').append('<p class="eof-message">No new notifications</p>');
    }
    
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
    
    document.getElementById('update-now-button').addEventListener('click', getNotifications);
    createAlarms();
    
});


