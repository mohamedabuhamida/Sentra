# Sentra ML Research & Prompt Injection Pipeline

This directory contains the machine learning research experiments, datasets, model fine-tuning pipelines, and evaluation benchmarks for the **Sentra AI Gateway**.

## 1. Pipeline Architecture

```text
+-----------------------------+
| Datasets Ingestion          |
| (Deepset, BIPIA, Jailbreaks)|
+--------------+--------------+
               |
               v
+-----------------------------+
| Feature Engineering         |
| Tokenization & Augmentation |
+--------------+--------------+
               |
               v
+-----------------------------+
| Model Fine-Tuning           |
| (DeBERTa-v3, RoBERTa, SVM)  |
+--------------+--------------+
               |
               v
+-----------------------------+
| Adversarial Robustness Eval |
| Precision, Recall, FPR, ROC |
+--------------+--------------+
               |
               v
+-----------------------------+
| ONNX / PyTorch Export       |
| to FastAPI Backend Engine   |
+-----------------------------+
```

## 2. Notebooks Structure

1. `01_prompt_injection_dataset_exploration.ipynb`
   - Exploration of prompt injection benchmarks, class distributions (Benign vs Malicious), length statistics, and attack types.
2. `02_deberta_prompt_injection_classifier.ipynb`
   - End-to-end training and fine-tuning of `microsoft/deberta-v3-small` / `base` using PyTorch & HuggingFace Trainer.
3. `03_intelligent_routing_model_evaluation.ipynb`
   - Multi-objective task routing benchmark comparing heuristic routing vs ML-based cost-quality Pareto frontiers.
4. `04_adversarial_robustness_testing.ipynb`
   - Zero-day character perturbations, base64 obfuscation, and jailbreak evasion stress tests.

## 3. How to Run

```bash
cd "models notebook"
python -m venv venv
# On Windows
.\venv\Scripts\activate
pip install -r requirements.txt
jupyter lab
```
