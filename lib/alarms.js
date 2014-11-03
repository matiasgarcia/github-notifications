/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function createalarm(){
    console.log("Creating alarms");
    chrome.alarms.create("Github Notifications Alarm",{delayInMinutes:0.25  ,periodInMinutes:0.125 });
    chrome.alarms.onAlarm.addListener(function(alarm){
        console.log("alarm triggered");
        getNotifications;
    });
    console.log("fin");
}
