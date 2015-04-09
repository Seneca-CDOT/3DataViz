#!/bin/bash
echo "Installing NodeJS"
sudo apt-get -y update
sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
#echo "Installing GIT"
#sudo apt-get install -y git
echo "Installing NPM"
sudo apt-get install -y npm
#echo "Updating NPM registry"
#sudo npm config set registry http://registry.npmjs.org/
echo "Installing MongoDB"
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get -y update
sudo apt-get install -y mongodb-org

#avoid the issue of MODULE_NOT_FOUND on ../build/Release/bson
sudo apt-get install -y gcc make build-essential
npm update

mkdir -p /home/app
mkdir -p /data/db
sudo chown -R vagrant /data

cd /home/app
sudo npm install mongodb
echo "Installing express"
sudo npm install express
#echo "Installing Socket.io"
#sudo npm install socket.io

echo "Downloading oscar-all.json..."
wget https://www.dropbox.com/s/tmg0gvqkcx1pr4r/oscar-all.json > /dev/null 2>&1
echo "Downloading apple.json..."
wget https://www.dropbox.com/s/y9s64d36xig50iz/apple.json > /dev/null 2>&1

mongod
echo "Importing oscar-all.json"
mongoimport --db tweets --collection oscars --file oscar-all.json --jsonArray
echo "Importing apple.json"
mongoimport --db tweets --collection apple --file apple.json --jsonArray

echo "shutdown mongod"
sudo service mongod stop
