# 3D-vis

## Requirements
- [Node JS](https://nodejs.org/it/download/) 16+

## Setup

    git clone https://github.com/masc-it/3d-vis
    cd 3d-vis/
    npm install

## Data setup

Your *conf.json* will contain information about your data:

- dataset_path
    - points to your images folder
- data_json
    - points to your json file containing 3-dimensional features

*data_json* has the following schema:

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

## Run (DEV)

    npm run start

## Build (PROD)

    npm run make
