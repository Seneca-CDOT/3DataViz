#3D data visualization project (Draft)

##Background

In this project, we are developing a web application prototype that would allow users to visualize their data in 3D world.

Our main focus on this project is creating a mechanism or a tool that can process various types of data formats and visualize them on a specific visualization template that we built so that users can visualize their data in 3D world without knowing much of technologies around it.

---
##Demo
http://seneca-cdot.github.io/3DataViz/

###Instruction:
1.Choose a data source from options.
- **twitterDB** - collected tweets from apple wwdc2015
- **twitterLive** - live tweets of specified keyword
- **csv** - flight path ( currently you cannot specify your file )
- **spread sheet** - google spread sheet ( currently only this [data](https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml) works. )
- **google trends** - google trends of specified keyword.

2.Fill out required information for the option you chose.
3.Choose rendering type from Geometry and Texture
4.Choose template type from options.
5.Click visualize.

---
##Architecture
What we have built so far is an application prototype that consists of  mainly these.
- Architecture
- Data Processor ( Client )
- Visualization Templates ( Client )
- APIs ( Server )

Here is a diagram of our architecture of our application.
![Alt text](./3dataviz-architect.png) (Put dyagram here)

###Data Processor - Parser & Transformer
![Alt text](./3dataviz-dataprocessor.png) (Put dyagram here)

###Visualization Templates
There are currently four different types of visualization templates in our application.
1. Countries
2. Points
3. Dynamic
4. Flight path

###APIs
There are currently two APIs that we provide from server side.
1. Twitter data which aggregated in DB
2. Live tweets from Twitter.

##Contacts
Please contact us if your have any feedbacks to our work.
[@cathyatseneca](https://github.com/cathyatseneca)
[@hamabama](https://github.com/Hamabama)
[@collamo](https://github.com/collamo)
