#3D data visualization project (Draft)

In this project, we are developing a web application prototype that would allow users to visualize their data in 3D world.

Our main focus on this project is creating a mechanism or a tool that can process various types of data formats and visualize them on a specific visualization template that we built so that users can visualize their data in 3D world without knowing much of technologies around it.

##Demo
http://seneca-cdot.github.io/3DataViz/

1. Choose a data source from options.
  - **twitterDB** - collected tweets from apple wwdc2015
  - **twitterLive** - live tweets with specific keyword
  - **csv** - flight path ( currently you cannot choose different file for it )
  - **spread sheet** - google spread sheet ( currently only this [data](https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml) works. )
  - **google trends** - google trends with specific keyword.

2. Fill out required information for the option you chose if necessary.
3. Choose rendering type from Geometry or Texture.
4. Choose template type from options.
5. Click visualize.

---
##Architecture
What we have built so far is an application prototype that consists of mainly these.
- Architecture
- Data Processor ( Client )
- Visualization Templates ( Client )
- APIs ( Server )

Here is the diagram of our application architecture.
![Alt text](http://seneca-cdot.github.io/3DataViz/images/3dataviz-architect.png)

###Data Processor - Parser & Transformer
![Alt text](http://seneca-cdot.github.io/3DataViz/images/3dataviz-dataprocessor.png)


Data processor is one of the most important part of our project. There are two main modules within the data processor. One is **parser** and the other one is **transformer**.

When the parser receives data and its data type, the parser will choose suitable functions to parse it. Then, the parser will output **normalized data** and pass it to the transformer.

The transformer will transform the **normalized data** in the format that specific visualization template can understand and visualize the data.
 
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
Please contact us if your have any feedbacks for the project.
  - [@cathyatseneca](https://github.com/cathyatseneca)
  - [@hamabama](https://github.com/Hamabama)
  - [@collamo](https://github.com/collamo)