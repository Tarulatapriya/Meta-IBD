# MetaIBD

MetaIBD is a bioinformatics + AI application for analyzing metabolomics data from patients with Inflammatory Bowel Disease (IBD). This repository contains the data and preprocessing pipeline for Stage 1 of the project.

## Project Structure

- `data/raw/`: Contains the raw dataset files.
- `data/processed/`: Output directory for the preprocessed datasets.
- `src/preprocessing/`: Contains the preprocessing pipeline logic.
- `notebooks/`: Directory for Jupyter notebooks.
- `tests/`: Directory for test scripts.
- `requirements.txt`: Python package dependencies.

## Stage 1A: Dataset Consolidation

The first step in preprocessing is to consolidate the four raw dataset chunks into a single data matrix and a metadata table. This process parses the metadata headers, validates the sample IDs and columns, and vertically concatenates the 4 separate data chunks.

Run the consolidation script:
```powershell
python src/preprocessing/consolidate_dataset.py
```

This will create `data/processed/ST000923_metabolomics.csv`, `data/processed/ST000923_metadata.csv`, and a `consolidation_report.json` validation report.

To run the validation tests:
```powershell
python -m pytest tests/test_consolidation.py
```

## Stage 1: Dataset Inspection and Preprocessing (Draft)

The `src/preprocessing/pipeline.py` script performs the following tasks:
- Loads and concatenates the raw datasets
- Identifies metadata (SampleID, Diagnosis, Sex) and metabolite columns
- Calculates missing-value percentages and filters metabolites based on a threshold
- Performs half-minimum imputation for missing values
- Applies a log2 transformation
- Standardizes the features
- Saves the cleaned dataset into `data/processed/`

## Running the Pipeline

Activate the virtual environment and run the pipeline script:

```powershell
venv\Scripts\Activate.ps1
python src/preprocessing/pipeline.py
```
