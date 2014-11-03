/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function createAlarms(){
    console.log("Creating alarms");
    chrome.alarms.create("Github Notifications Alarm",{delayInMinutes:0  ,periodInMinutes:1 });
    chrome.alarms.onAlarm.addListener(function(alarm){
        console.log("alarm triggered");
        getNotifications;
    });
}
