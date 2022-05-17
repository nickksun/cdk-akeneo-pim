export SECRET_ARN="%SECRET_ARN%"
export AWS_REGION=`curl --silent http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region`
export APP_DATABASE_HOST="%DB_ENDPOINT%"
export APP_DATABASE_PORT="%DB_PORT%"
export APP_DATABASE_NAME="akeneo"
export APP_DATABASE_USER="admin"
export APP_INDEX_HOSTS="%ES_ENDPOINT%"
export AKENEO_PIM_URL="%AKENEO_PIM_URL%"