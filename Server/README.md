To install a db server you need the following:

#Setting up a virtual machine
1. Go to https://www.virtualbox.org/ and install Virtual Box.
2. Go to https://www.vagrantup.com/ and install Vagrant.
3. Grab the Vagrantfile and install.sh and place the into a folder.
Vagrantfile has a config for a virtual machine. It forwards 27018 port to your local machine for DB purposes.
Install.sh contains the installation of mongodb on your virtual machine.
4. Go to the folder where you placed above files and download a box for virtual machine: ```vagrant box add hashicorp/precise64```
5. Then to run the vm issue this: ```vagrant up```, so it will start it up amd then execute install.sh to install mongodb.
6. This will automatically sync both Application and Server folder to the virtual machine.
7. You can login by issuing ```vagrant ssh```
8. If you want to copy other files over to the virtual machine, you can put files either Server or Application folders. Or add the line in Vagrantfile to set your directly to sync.
```config.vm.synced_folder "path/to/directory/in/your/computer", "path/to/directory/in/virtual/machine" , type: "rsync"```

#Run mongodb
1. Make sure that port 27017 is available on your machine, otherwise you will have to change it on your vm.
2. Type ```mongod --dbpath /data/db --port 27017``` to run.
3. Now you have an access to mongodb in console by typing ```mongo```, tweets data from oscars and apple are available.

#Run application
1. Type ```node server.js``` to run our server in /home/app/server.
2. Now our application is available on ```http://localhost:7777```