# 3D-vis

Interactive, high performance 3D visualization app written in plain Typescript and THREE.js. Built with Computer Vision in mind.

3D-vis has been tested with up to 30k points in the scene.

[3D-vis PowerPoint Presentation (DRIVE)](https://docs.google.com/presentation/d/1qbguZI4_A4MCA_eivn93SMH3Rqy9NJ-HEzIJ-BrCIz0/edit?usp=sharing)

<img src="https://github.com/masc-it/3d-vis/raw/main/imgs/3dvis.gif" >

<img src="https://github.com/masc-it/3d-vis/raw/main/imgs/img1.png" width="300px">

## Requirements
- [Node JS](https://nodejs.org/it/download/) 16+


## Setup

    git clone https://github.com/masc-it/3d-vis
    cd 3d-vis/
    npm install

## Data setup

*~/3d-vis-configs/* and *./configs* folders contain all your plots configuration (JSON).

Each of them will be associated to a different plot in the 3D world.

A data config file contains information about your data:

- dataset_path
    - points to your images folder
- type
    - plot type (scatter, bar, ..)
- data_json
    - path to a json file containing 3-dimensional features
    - different schema for each plot type
- position
    - [x,y,z] starting point camera coordinates

*data_json* for a *scatter plot*:

- labels: list[any]
    - list of unique labels
- num_labels: int
    - total number of labels
- data: list[object]
    - x
    - y
    - z
    - label
    - img_name

*data_json* for a *bar plot*:

- labels: list[any]
- data: list[number]

You can find an example in example-data.json

## Run (DEV)

    npm run start

## Build (PROD)

    npm run make
