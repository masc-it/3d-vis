# 3D-vis

## Requirements
- [Node JS](https://nodejs.org/it/download/) 16+

## Setup

    git clone https://github.com/masc-it/3d-vis
    cd 3d-vis/
    npm install

## Data setup

The *configs* folder contains all your data configuration files (JSON).

Each of them will be associated to a different plot in the 3D world.

A data config file contains information about your data:

- dataset_path
    - points to your images folder
- type
    - plot type (scatter, bar, ..)
- data_json
    - points to your json file containing 3-dimensional features
    - different schema for each plot type

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

## Run (DEV)

    npm run start

## Build (PROD)

    npm run make
