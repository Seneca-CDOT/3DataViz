#!/bin/bash
#echo "Installing GIT"
#sudo apt-get install -y git
#echo "Installing NodeJS"
#sudo add-apt-repository -y ppa:chris-lea/node.js
#sudo apt-get -y update
#sudo apt-get install -y nodejs
#echo "Installing NPM"
#sudo apt-get install -y npm
#echo "Updating NPM registry"
#sudo npm config set registry http://registry.npmjs.org/
echo "Installing MongoDB"
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get -y update
sudo apt-get install -y mongodb-org
#echo "Installing express"
#cd /home/app
#sudo npm install express
#echo "Installing Socket.io"
#sudo npm install socket.io
