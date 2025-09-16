## PostgreSQL Database Setup 

- First of all we need to install PostgreSQL. Since I used Docker image of PostgreSQL so i don't need to install PostgreSQL.
  Here I will guide you how to start PostgreSQL through Docker.

- If you wish to install PostgreSQL, you can install from https://www.postgresql.org/download/

### Step 1 : Install Docker Desktop (If not Installed)

  - You can install from https://docs.docker.com/desktop/setup/install/windows-install/ 

### Step 2 :  Open Docker Desktop and Run following command in command prompt

  - Once you open Docker Desktop, docker service will automatically starts
  - Run this command in cmd :
    ```
    docker run --name <CONTAINER NAME> -e POSTGRES_PASSWORD=<POSTGRESQL PASSWORD> -e POSTGRES_USER=<POSTGRESQL USERNAME> -e POSTGRES_DB=<POSTGRESQL DB NAME> -p 5432:5432 -d postgres:15
    ```
    This will load postgresql image, if image was not found then it will automatically install image from Docker Hub.

    Replace :

    `<CONTAINER NAME>` with your container name which you want to keep
    `<POSTGRESQL PASSWORD>` with your postgresql password. Remember this password and store somewhere
    `<POSTGRESQL USERNAME>` with your postgresql username
    `<POSTGRESQL DB NAME>` with your postgresql database name (It will create new database)
    
    

    
