# pirobot
Robot/car on a Raspberry Pi 2

This project has below features:
-  Controlling a 2-wheel robot via web interface over internet.
-  Live "video" streaming from the robot's "eye" - a RPI camera.
-  Basic user management: each user has 1 minute to control the robot.

How-to:
------
1. A Raspberry PI (I used a RPI 2) with Raspbian installed, a RPI camera ( I used a RPI camera G ), a USB wifi card.
2. Necessary components to build a "robot". I ordered an L298N controller, 2 motors, 1 chasis with 2 wheels, several 
jumpers(male to male, male to female, female to female) from a [taobao shop](http://shop112183962.world.taobao.com/?spm=a312a.7728556.2015080705.4.cdD31B),
altogher 51 RMB. Power module: I used an Aiguo OL10400 which has two USB outputs for RPI and L298N.
3. The mechanism part should be easy. Not exactly the same, but [this video](https://www.youtube.com/watch?v=AZSiqj0NZgU) may be helpful.
4. Nodejs. I need "onoff" module to control the GPIOs but it has installation issue on Nodejs 0.11.9 and 0.12.5. I ended up to install Nodejs 0.10.28.
5. Clone the project to your RPI, say /home/pi/pirobot.
6. Better to setup a [Ramdisk](https://wiki.archlinux.org/index.php/Tmpfs) and make a symbolic link to /home/pi/pirobot/public/img2. Otherwise you need to create an "img2" folder under pirobot/public, with the risk of ruining your SD card by frequent disk writes. This folder is used to store the captured image for the live "video" streaming.
7. It can run with the default configurations, but it's better to create a "config.json" in the pirobot/utility folder. The content is like:
```
{  
  "fakemode": false,  
  "port": 3000,  
  "leftforward": 19,  
  "leftback": 26,  
  "rightforward": 16,  
  "rightback": 20,  
  "maxtime": 60,  
  "shottime": 1000  
}  
```
8. In the project root dir, execute the command:  
**node bin/www**  
Use your browser on iPhone/android/PC/MAC, connect to: `http://<rpiaddress:3000>` and have fun!
9. With DDNS and supervisord, you can control your "robot" to navigate your room from anywhere, or show your place to your friends from anywhere. 
