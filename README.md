To install a db server you need the following:

1. Go to https://www.virtualbox.org/ and install Virtual Box.
2. Go to https://www.vagrantup.com/ and install Vagrant.
3. Grab the Vagrantfile and install.sh and place the into a folder.
Vagrantfile has a config for a virtual machine. It forwards 27018 port to your local machine for DB purposes.
Install.sh contains the installation of mongodb on your virtual machine.
4. Go to the folder where you placed above files and download a box for virtual machine: 'vagrant box add hashicorp/precise64'
5. Then to run the vm issue this: 'vagrant up', so it will start it up amd then execute install.sh to install mongodb.
6. If you want to copy something over to the virtual machine, you need to create a 'datasets' folder and put there your files. It will be rsynced to '/home/datasets' of your vm. For example you can put there your json file, which you are going to import to your db.
7. You can login by issuing 'vagrant ssh';
8. You need to create a folder for your db. Let's say the folder will be 'db'.
9. Make sure that port 27017 is available on your machine, otherwise you will have to change it on your vm.
10. mongod --dbpath /home/datasets/db --port 27018  ( in case you change the port )
11. Import datasets by issuing 'mongoimport --db mydb --collection oscars --file oscars.json --jsonArray'
12. Done. Now you can connect from your app to db by address 'localhost:27107/mydb'