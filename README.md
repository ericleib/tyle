
# Tyle

Tyle lets engineers and scientists augment their data with dynamic views.

Tyle-Explorer is the application to open Tyle files (written in XML format).

**Tyle-Explorer** works as a static web application (pure html/css/js), which allows to access data over simple HTTP (A file server is required -- [Example here][https://github.com/ericleib/tyle/blob/master/test/label.xml]).
**Tyle-Explorer-Desktop** is an extension of Tyle-Explorer running as a standalone application. It is based on *Node-Webkit*, and works exactly like the web version, excepts it allows to access data over additional protocols (local, FTP, SSH).

## Download and run Tyle-Explorer-Desktop the quick way

Sounds like you just need to [download the executable for your platform](http://gettyle.com).

## Clone and install Tyle-Explorer locally

**Prerequisite**: You need to install [Node.js](https://nodejs.org/download/).

Then, just clone this repository locally, and install the project dependencies (this might take a few minutes).

    git clone https://github.com/ericleib/tyle.git
    cd tyle
    npm install

## Run Tyle-Explorer-Desktop

**Prerequisite**: You must first install **nw** (Node-Webkit) globally. This installation will take another few minutes.

    npm install nw -g

In your `tyle/` folder, run:

    nw

...which should launch the Tyle-Explorer GUI.

## Build Tyle-Explorer-Desktop

*Note: you don't need to install nw to build the application*

To build all versions (Linux 32 bits & 64 bits, Windows 32 bits & 64 bits, OSX 32 bits & 64 bits):

    npm run gulp

To build a specific version:

    npm run gulp -- --win32  # or win64, osx32, osx64, linux32, linux64

The first time you will build the project, large nw files will be downloaded and cached, which takes a long time. The next time, it will go much faster.

## Example

The `test/` folder contains examples of data that Tyle-Explorer can read and display. Navigate to this folder and select a file to view its contents.
