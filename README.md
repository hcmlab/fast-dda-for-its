# Fast Dynamic Difficulty Adjustment for Intelligent Tutoring Systems with Small Datasets

The repository contains data and scripts for data visualisation and simulation used in the EDM'23 paper "Fast Dynamic Difficulty Adjustment for Intelligent Tutoring Systems with Small Datasets".

To run all the scripts here, you need Python 3, Node.js, and MongoDB installed. The required Python packages are listed in `requirements.txt`.

## Quick Start Guides

The sections below list the different sub-applications that are contained in the repository. Each of these can be easily launched as described.

### Web Application

The web application for the user study is located in `webapp`. You first need to install packages by opening the command line, entering the directory `webapp`, and typing `npm install`. Then you can start the application with `node index.js`, and then the application is accessible at `localhost/index.html`. You can change the method of exercise selection by changing the setting in the header of `webapp/index.js`.

### Simulations

To run simulations, first you need to start the web application as described above, since the Python script calls the API hosted in the web application. Then run the Python script `simulation/simulate_user.py`. The graphic results from the simulations are saved in `plots_simulation`.

### Data Analysis

The collected data is located in `data`, containing the data used for analysis, for training the DDA model, and the intermediate results from the knowledge tracing model used to perform further analysis. These are used by scripts in `data-analysis` to generate various plots and perform statistical tests. The plots are stored in `plots`.