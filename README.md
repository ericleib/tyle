
# Tyle

Tyle lets engineers and scientists augment their data with dynamic views.

Tyle-Explorer is the application you need to open Tyle files (written in XML format -- [Example here](https://github.com/ericleib/tyle/blob/master/test/label.xml)).

**Tyle-Explorer** works as a static web application (pure html/css/js), and allows to access data over simple HTTP (a file server is required).
**Tyle-Explorer-Desktop** is an extension of Tyle-Explorer running as a standalone application. It is based on *Node-Webkit*, and works exactly like the web version, except it allows to access data over additional protocols (local, FTP, SSH).

## Download and run Tyle-Explorer-Desktop *the quick way*

Sounds like you just need to [download the executable for your platform](http://gettyle.com).

## <a name="install"></a> Download and install Tyle-Explorer

**Prerequisite**: You need to install [Node.js](https://nodejs.org/download/).

Just clone this repository locally (or [download the zip](https://github.com/ericleib/tyle/archive/master.zip)), and install the project dependencies (this might take a few minutes).

    git clone https://github.com/ericleib/tyle.git
    cd tyle
    npm install

## Run Tyle-Explorer in the browser

You need one thing to run the web version of Tyle-Explorer: A static file server to host the application's files. You can use any technique of your choice to do this. But if you want to get started quickly, the following is probably the best:

In the console, run:

    node server.js

Then, go to your browser and browse to [http://localhost:8080/](http://localhost:8080/). You should see the Tyle-Explorer GUI.


## Run Tyle-Explorer-Desktop

You may run Tyle-Explorer-Desktop by just [downloading](http://gettyle.com) and launching the executable corresponding to your platform. But if you want to develop, debug and extend the app (or if you just enjoy looking under the hood), you should run the application from its sources. Fortunately, it is very simple to achieve.

**Prerequisite**: You must first install **nw** (Node-Webkit) globally. This installation will take a few minutes.

    npm install nw -g

Assuming you followed the [installation instructions](#install), in your `tyle/` folder, run:

    nw

...which should launch the Tyle-Explorer-Desktop GUI.

## Build Tyle-Explorer-Desktop

*Note: you don't need to install nw to build the application*

To build all versions (Linux 32 bits & 64 bits, Windows 32 bits & 64 bits, OSX 32 bits & 64 bits):

    npm run gulp

To build a specific version:

    npm run gulp -- --win32  # or win64, osx32, osx64, linux32, linux64

The first time you will build the project, large nw files will be downloaded and cached, which takes a long time. The next time, it will go much faster.

## Example

The `test/` folder contains examples of data that Tyle-Explorer can read and display. Navigate to this folder and select a file to view its contents.
