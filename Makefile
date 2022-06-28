.PHONY: mlb2022.json
mlb2022.json:
	jq -s '.|add' daily/mlb-2022-0*json > docs/mlb2022.json
