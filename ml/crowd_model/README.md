# ml/crowd_model/

Trains the crowd-level prediction model (PDD §6, FR6).

**Data honesty note:** this model is trained on **synthetic time-series data**,
calibrated against publicly reported festival/event footfall figures (news
articles citing real crowd estimates), not on a live sensor feed. The model
itself — the regression/LSTM logic — is genuinely trained and evaluated.
Only the input data source is simulated, standing in for a real
temple-authority or CCTV/IoT partnership that a student project cannot
obtain. This is documented here, in the main README, and in-app (NFR1),
not hidden.

Planned contents (Milestone 7):
- `generate_synthetic_data.py` — builds a realistic synthetic footfall dataset
- `train.py` — trains the model
- `evaluate.py` — reports RMSE / classification accuracy on held-out data
