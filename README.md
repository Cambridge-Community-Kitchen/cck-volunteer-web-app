# Developer Quickstart

The console commands below assume you are developing on a Debian-based Linux system and were tested with Ubuntu 22.04.1; modify to suit your particular setup.

# Install base requirements
To run this code, you will need:

* git (source code upload/download)
* Node.js (code runtime; we suggest the latest runtime supported by AWS lambda; as of 13/09/22 v16)
* MySQL (database instance)

```console
sudo apt -y install curl
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt update
sudo apt -y install git nodejs mysql-server
```

# Clone the repo and install dependencies

```console
git clone https://github.com/agolden/cck-volunteer-app
cd cck-volunteer-app
npm install
```

# Browser

We suggest installing and using Chromium as your principal browser for development purposes.

```console
sudo apt install -y chromium-browser
```

# IDE

We suggest installing and using [Visual Studio Code](https://code.visualstudio.com/download) as your integrated development environment (IDE).

# Development environment setup

## Environment variables

To successfully run this application, you must set several environment variables.

The .env.local file must be present in the root of the directory. You can use the example environment variables file as a starting point:

```console
cp example.env.local .env.local
ln -s .env.local .env
```

In this file, there are several default variables that may be changed (and several others that may be added):

* **DB_HOST** - *(required&#10071;)* - The database instance's fully qualified domain name
* **DB_MASTER_USER** - *(required&#10071;)* - The database master user (required for db user creation)
* **DB_MASTER_PASSWORD** - *(required&#10071;)* - The database master user's password
* **DB_NAME** - *(required&#10071;)* - The name of the application's database
* **DB_PIPELINE_USER** - *(required&#10071;)* - The database pipeline user (required for schema migrations)
* **DB_PIPELINE_PASSWORD** - *(required&#10071;)* - The database pipeline user's password
* **DB_USER** - *(required&#10071;)* - The application's database username
* **DB_PASSWORD** - *(required&#10071;)* - The application's database password
* **JWT_SS** - *(required&#10071;)* - The secret used in generating / validating JSON web tokens (for authentication/authorization purposes)
* **DEBUG** - Enables debugging functionality, e.g., logging one time passwords to console
* **NO_DB_SSL** - Disables SSL connections to the database. Should likely only be set to 'true' when connecting to localhost.

## Helper scripts

A series of (optional) scripts are provided that will simplify the process of setting up your local development environment. Execute them in the following sequence:

A script has been provided to randomly generate passwords for your .env.local file:
```console
./scripts/generate-passwords.sh
```

A script has been provided to update the database's root user's password from the .env.local file:
```console
sudo ./scripts/update-master-db-password.sh
```

A script has been provided to create the application's database and database user:
```console
./scripts/create-db.sh
```

## Application scripts

The package.json defines a number of scripts for use in development:

* **dev** - Runs the development environment locally on port 3000
* **build** - Builds the code for deployment. All code must successfully build or else it cannot be deployed.
* **lint** - Helps keep your code nice and tidy! All code must pass lint or it cannot be deployed.
* **test** - Runs unit tests. The pipeline will ultimately reject anything that doesn't pass tests.
* **update-schema** - After changes are made to the schema.prisma file - or when first configuring your environment, this script should be run to deploy the schema to the database.
* **seed-db** - Seeds database with basic cck data (i.e., organization, event types, etc.)

Run the scripts as follows:
```console
npm run <<script>>
```

For example:
```console
npm run update-schema
```

# Database management

## Stack management

The AWS cloudformation stack can be created / updated / deleted using the AWS CLI, for example:
```console
aws cloudformation create-stack --stack-name my-awesome-stack-name --template-body file://aws/aws-cloudformation.yml --capabilities CAPABILITY_NAMED_IAM
aws cloudformation update-stack --stack-name my-awesome-stack-name --template-body file://aws/aws-cloudformation.yml --capabilities CAPABILITY_NAMED_IAM
aws cloudformation delete-stack --stack-name my-awesome-stack-name
```

Once the stack has been successfully deployed, the relevant secrets can be retrieved as follows:
```console
aws secretsmanager get-secret-value --secret-id aws-arn:aws:secretsmanager:eu-west-2:myaccountid:secret:my-credential-id
```

## Database backup

Here is an example of backing up the contents of the MySQL server:

```console
mysqldump -h "myawesome.database.instance.com" --all-databases --triggers --routines --events --user=admin -p > dump.sql
```
