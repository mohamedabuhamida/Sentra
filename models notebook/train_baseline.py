"""
Sentra AI Gateway — Semester 1 ML Baseline
Trains a TF-IDF + Logistic Regression classifier on prompt injection benchmark dataset.
Outputs accuracy, precision, recall, F1, and saves model weights.
"""

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

def train_baseline():
    dataset_path = os.path.join(os.path.dirname(__file__), "datasets", "prompt_injection_sample.csv")
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        return

    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset: {len(df)} samples.")
    print("Class distribution:\n", df['label'].value_counts())

    X = df['prompt']
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    clf = LogisticRegression(C=1.0)
    clf.fit(X_train_vec, y_train)

    preds = clf.predict(X_test_vec)
    acc = accuracy_score(y_test, preds)

    print("\n--- Semester 1 ML Baseline Results ---")
    print(f"Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, preds, zero_division=0))

if __name__ == "__main__":
    train_baseline()
