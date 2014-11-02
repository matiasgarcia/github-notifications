/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function createalarm(){
    chrome.alarms.create("Github Notifications Alarm",{delayInMinutes:1,periodInMinutes:0.125 });
    chrome.alarms.onAlarm.addListener(function(alarm){
    updateNotifications();
});
}
