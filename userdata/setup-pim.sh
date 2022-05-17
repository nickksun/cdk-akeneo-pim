touch /var/www/pim/.env.local
echo "APP_DATABASE_HOST=$APP_DATABASE_HOST" >> /var/www/pim/.env.local
echo "APP_DATABASE_PORT=$APP_DATABASE_PORT" >> /var/www/pim/.env.local
echo "APP_DATABASE_NAME=$APP_DATABASE_NAME" >> /var/www/pim/.env.local
echo "APP_DATABASE_USER=$APP_DATABASE_USER" >> /var/www/pim/.env.local
echo "APP_INDEX_HOSTS=$APP_INDEX_HOSTS" >> /var/www/pim/.env.local
echo "AKENEO_PIM_URL=$AKENEO_PIM_URL" >> /var/www/pim/.env.local
echo "APP_DATABASE_PASSWORD=`aws secretsmanager get-secret-value --secret-id $SECRET_ARN --region $AWS_REGION --query SecretString --output text | jq -r '."password"'`" >> /var/www/pim/.env.local
echo "APP_ENV=prod" >> /var/www/pim/.env.local
echo "APP_DEBUG=0" >> /var/www/pim/.env.local
echo "APP_DEFAULT_LOCALE=en" >> /var/www/pim/.env.local
echo "APP_SECRET=ThisTokenIsNotSoSecretChangeIt" >> /var/www/pim/.env.local
echo "APP_PRODUCT_AND_PRODUCT_MODEL_INDEX_NAME=akeneo_pim_product_and_product_model" >> /var/www/pim/.env.local
echo "APP_CONNECTION_ERROR_INDEX_NAME=akeneo_connectivity_connection_error" >> /var/www/pim/.env.local
echo "MAILER_URL=null://localhost?encryption=tls&auth_mode=login&username=foo&password=bar&sender_address=no-reply@example.com" >> /var/www/pim/.env.local
echo "APP_ELASTICSEARCH_TOTAL_FIELDS_LIMIT=10000" >> /var/www/pim/.env.local
echo "FLAG_QUANTIFIED_ASSOCIATION_ENABLED=1" >> /var/www/pim/.env.local
echo "COMM_PANEL_API_URL=https://pim-comm-panel.akeneo.com" >> /var/www/pim/.env.local
echo "FLAG_DATA_QUALITY_INSIGHTS_ENABLED=1" >> /var/www/pim/.env.local
echo "SRNT_GOOGLE_APPLICATION_CREDENTIALS=" >> /var/www/pim/.env.local
echo "GOOGLE_CLOUD_PROJECT=emulator-project" >> /var/www/pim/.env.local
echo "PUBSUB_EMULATOR_HOST=" >> /var/www/pim/.env.local
echo "PUBSUB_AUTO_SETUP=false" >> /var/www/pim/.env.local
echo "PUBSUB_TOPIC_BUSINESS_EVENT=" >> /var/www/pim/.env.local
echo "PUBSUB_TOPIC_JOB_QUEUE=" >> /var/www/pim/.env.local
echo "PUBSUB_SUBSCRIPTION_WEBHOOK=" >> /var/www/pim/.env.local
echo "PUBSUB_SUBSCRIPTION_JOB_QUEUE=" >> /var/www/pim/.env.local
echo "XDEBUG_MODE=off" >> /var/www/pim/.env.local