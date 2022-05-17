yum update -y
yum install jq -y
yum install docker -y
service docker start
groupadd -g 1000 www-data
useradd -u 1000 -g 1000 www-data
sudo curl -L "https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

mkdir -p /var/www/pim
chown -R www-data:www-data /var/www/pim

mkdir ~/.composer
chown -R www-data:www-data ~/.composer

mkdir -p ~/.cache/yarn
chown -R www-data:www-data ~/.cache

cd /var/www/pim
docker run -ti -u www-data --rm --env "COMPOSER_AUTH={\"github.com\": \"%GITHUB_TOKEN%\"}" --env "COMPOSER_MEMORY_LIMIT=4G" -v $(pwd):/srv/pim -v ~/.composer:/var/www/.composer  -w /srv/pim akeneo/pim-php-dev:6.0 php -d memory_limit=8192M /usr/local/bin/composer create-project akeneo/pim-community-standard /srv/pim "6.0.*@stable"
make upgrade-front

# APP_ENV=prod docker-compose run --rm php php bin/console pim:user:create
