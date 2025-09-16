## PostgreSQL Database Setup 

- First of all we need to install PostgreSQL. Since I used Docker image of PostgreSQL so i don't need to install PostgreSQL.
  Here I will guide you how to start PostgreSQL through Docker.

- If you wish to install PostgreSQL, you can install from https://www.postgresql.org/download/

### Step 1 : Install Docker Desktop (If not Installed)

  - You can install from https://docs.docker.com/desktop/setup/install/windows-install/ 

### Step 2 : Open Docker Desktop and Run following command in command prompt

  - Once you open Docker Desktop, docker service will automatically starts
  - Run this command in cmd :
    ```
    docker run --name polling-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=polling -p 5432:5432 -d postgres:15
    ```
    This will load postgresql image with database name `polling`. If image was not found then it will automatically install image from Docker Hub.

    
### Step 3 : Verify PostgreSQL Database

  - Run following command in cmd :
    ```
    docker ps
    ```

    This will show the all running containers in docker

    <img width="1562" height="93" alt="image" src="https://github.com/user-attachments/assets/e83e45c7-e684-4d8b-b48b-2bbbb158d955" />

  - Then run this command
    ```
    docker exec -it polling-postgres psql -U postgres -d polling
    ```
    When you run above command it will prompt you to database terminal e.g `polling#`.
 
  - Then inside terminal run `\l` it will display all the databases. Find the database that you created in that list.

  <img width="1405" height="361" alt="image" src="https://github.com/user-attachments/assets/dad763ef-5afb-4360-acac-5f14b74d2b32" />



## Project Setup 

  - Follow below steps to run the project
    
### Step 1 :  Clone Repo

  - Clone my repository
    ```
    git clone https://github.com/heetp0101/Real-time-Polling.git
    ```

### Step 2 : Install dependencies

  - Run following command to install all dependencies
    ```
    cd Real-time-Polling
    npm install
    ```

### Step 3 : Add .env file 

  - Create .env file and add `DATABASE_URL` to connect with PostgreSQL Database
    ```
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/polling?schema=public"
    ```

### Step 4 : Generate Prisma Client

  - Run the following command to generate prisma client
    ```
    npm run prisma:generate
    ```

### Step 5 :  Run Backend (Node.js) Server

    npm run dev


### Step 6 :  Run API Endpoints

  - Open POSTMAN API Testing Tool and run following API Endpoints

  1. Fetch all the Users
     
     - To fetch all the users, send request `GET http://localhost:5000/users`

  3. Add New User

     - To add a new user, send request `POST http://localhost:5000/users` along with Body :
       ```
       {
         "name" : "Bob"
         "email" : "bob123@gmail.com"
         "password" : "bob123"
       }
       ```
     - You will get response with status code 201 with `id`, `name`, and `email`

  4. Get User Polls

     - To fetch all the user polls along with poll options, send request `GET http://localhost:5000/polls`. You will get reponse for all the user polls with poll options.

  5. Add New Poll

     - To add new poll, send reuest `POST http://localhost:5000/polls` along with following Body :
       ```
       {
         "question": "Which state in India has highest GDP ?",
         "creatorId": 1,
         "options": ["Maharashtra", "Gujarat", "Uttar Pradesh"]
        }
       ```

  6. Cast a Vote

     - To cast a vote send request `POST  http://localhost:5000/votes` along with following Body :
       ```
       {
         "userId": 1
         "pollOptionId": 1
       }
       ```
     - Here `userId` references from `id` of User and `pollOptionId` references from `id` of PollOption     

  7. Fetch Results

     - To fetch the results from the specific poll by their pollId, send request  `GET http://localhost:5000/polls/1/results`, it will return `pollId`, `results` Array with `id`, `text`, `voteCount`


