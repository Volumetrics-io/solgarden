

curl --request POST \
  --url https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "The day the skies fell silent, and the cities burned like funeral pyres, we knew the age of machines had begun.",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.5,
    "style": 1,
    "speakerBoost": true
  }
}'
