# 3D-vis

Interactive, high performance 3D visualization app written in plain Typescript and THREE.js. Built with Computer Vision in mind.

3D-vis has been tested with up to 30k points in the scene.

[3D-vis PowerPoint Presentation (DRIVE)](https://docs.google.com/presentation/d/1qbguZI4_A4MCA_eivn93SMH3Rqy9NJ-HEzIJ-BrCIz0/edit?usp=sharing)

<img src="https://github.com/masc-it/3d-vis/raw/main/imgs/3dvis.gif" >

<img src="https://github.com/masc-it/3d-vis/raw/main/imgs/img1.png" width="300px">

# Requirements
- [Node JS](https://nodejs.org/it/download/) 16+


## Setup

    git clone https://github.com/masc-it/3d-vis
    cd 3d-vis/
    npm install

# Data setup

## Plot config
A **plot config** file contains information about your plots and where your data is located at:

- type
    - plot type (scatter, bar, ..)
- data_json
    - absolute path to a **data config** file
- position
    - [x,y,z] starting point camera coordinates

You can find an example in **example.plot.json**

## Data config
A **data config** file instead, contains all your data to be rendered. This one can be located anywhere on your PC.

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

You can find an example in **example.data.json**

## Run (DEV)

    npm run start

## Build (PROD)

    npm run make
