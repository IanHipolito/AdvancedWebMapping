# Advanced Web Mapping CA 2:
In this readme I will discuss and break down of my advanced web mapping CA 2 project.

### Link to site: 
* https://c21436494.xyz/
### Link to docker repositories (backend and frontend): 
* https://hub.docker.com/repository/docker/ianhipolito659/geodjango_tutorial_image/general
* https://hub.docker.com/r/ianhipolito659/frontend_image

# Features (Will be discussed in further detail in the readme):
* **User Authentication:** Signup, login, and logout functionality.
* **Geolocation:** Users can update their location and view nearby hospitals.
* **Hospital Data:** Displays hospitals from a GeoJSON file with details like name, address, and category.
* **Interactive Map:** Utilises Leaflet for map rendering with markers for hospitals and user location.
* **Creating, Manipulating and Storing Spatial Data:** I am able to create, manipulate, and store data in my django admin page.
* **Search Functionality:** Users are able to search for specific hospitals.
* **Find Closest Hospital:** Users can click a button to find the nearest hospital to their location (can also filter by subcategory to find nearest hospital in the selected category).
* **Subcategory Filtering:** Users can filter hospitals by subcategories.
* **Route Finding:** Users can click on a hospital marker and a pop up will appear with the option to find the fastest route.
* **Book Marking:** Users can bookmark specific hospitals and filter by only showing book marked hospitals.
* **User Location History Tracking:** This feature allows me to use Django admin backend tool to track users location history and current locations.

# Tech Stack
* Backend: Django with Django Rest Framework to handle user logins, registrations, updates and queries, and to handle server-side logic. Knox was implemented for token generation and authentication.
* Database: PostgreSQL with PostGIS for storing and managing geospatial data.
* Database Management: PgAdmin 4 for database management and monitoring.
* Mapping: Leaflet JS and OpenStreetMap for displaying interactive maps with precise user location tracking, and OSRM API for route calculation.
* Frontend: React, Typescript and CSS are used to create an interactive and user friendly interface.
* Containerisation & Deployment: Docker for application containerisation and AWS for hosting.

Please sign up to create an account and login, this will bring you to "/map/" where you will be able to see where all the hospitals in Ireland are located.

# Creating Docker Containers, Dockerising Containers, and Using AWS Cloud Services (Locally and Deployed):
## Steps For Local Setup Before Deployment:
After creating the project app, I created an environment called **awm_env** and activated it using these commands:
```
conda create -n awm_env python=3.12
conda activate awm_env
```

I then installed all the necessary libraries, configured my settings.py correctly, applied all the necesssary migrations, imported all the data, and created the **static** files here are some of the commands I used to do this:
```
python manage.py makemigrations

python manage.py migrate

python manage.py sqlmigrate world 0001

python manage.py sqlmigrate hospital 0001

python manage.py shell

# When in the shell terminal I ran these commands to import all the data
from world import load
load.run()

from hospital import load
load.run()
```

I then created a **dockerfile** and a **docker-compose.yml** file. The dockerfile is a script reponsible for giving instructions on building a docker image. The docker-compose.yml is used to define and run multi-container applications such as my django web application.

### dockerfile (backend):
![image](https://github.com/user-attachments/assets/dbb132af-8a97-4d48-b327-6a74b90ea8ce)

### dockerfile (Frontend):
![image](https://github.com/user-attachments/assets/693b786e-3019-47ca-b0cd-d5a6b1188577)

This file provides the instructions to build a Docker image for the Django application. It specifies the base image, installs necessary dependencies, copies application files, and defines commands to run the app. The Dockerfile ensures a consistent environment for the Django application, including specific libraries and configurations for deployment.

### docker-compose.yml File:
![image](https://github.com/user-attachments/assets/61acf1d6-69ee-43c5-8848-346530fb35e6)

This file defines the services, networks, and volumes needed to run the application in a Docker environment. It includes configurations for services like **nginx**, **pgadmin4**, **postgis**, **Django application**, and the **frontend_app**. Each service has specific settings such as ports, environment variables, and dependencies, which coordinate the entire application stack.

These files together facilitate setting up and running the application within a Docker environment, enabling easy deployment and consistent behavior across different systems.

I also created a file called **default.conf** which  contains the Nginx configuration for routing and handling HTTP requests for my application.

### default.conf File:
![image](https://github.com/user-attachments/assets/dbfba627-a5b5-47cb-b77b-8029e835f25a)

### frontend.conf File:
![image](https://github.com/user-attachments/assets/d51585ae-a6fb-406f-b2e0-885ea22f5570)

This configuration ensures that Nginx correctly serves your Django application and static assets, handling incoming requests efficiently.

I also created an **ENV.yml** file by running this command (made some modifications in the file):
```
conda env export --from-hisory > ENV.yml
```

### ENV.yml File:
![Screenshot 2024-11-10 043252](https://github.com/user-attachments/assets/477f34c0-d910-4a7c-b5d9-6e93f75821a6)

I used the following commands to build the backend and frontend images for my project:
```
docker build -t geodjango_tutorial_image .
docker build -t frontend_image .
```
I used the following command to compose up and create all the containers defined in the docker-compose.yml file:
```
docker-compose up
```

### Image of Containers and Images Used From Docker Desktop:
![image](https://github.com/user-attachments/assets/1a9bd68e-b403-4f5c-ac33-e27ab349e013)

## Steps For Deployment Setup After Local Setup:
After coding and creating all the app's functionality (app functionality will be discussed further down in the readme), and testing that everything is running and working smoothly on my localhost, I started the deployment process. I first created a docker repository to store my app's image (linked above), so that I could push and pull the latest image.

I started by rebuilding the images by using this command:
```
docker build -t ianhipolito659/geodjango_tutorial_image:latest .
docker build -t ianhipolito659/frontend_image:latest .
```
Then I pushed the built the images onto the docker repository by using this command:
```
docker push ianhipolito659/geodjango_tutorial_image:latest
docker push ianhipolito659/frontend_image:latest
```
After pushing the latest version of the images to the docker repository, I created an instance using AWS cloud services and connected to it.

### Steps For AWS:
After creating an **EC2** instance on AWS, I got the public IP address and created an **A record** configuration for the DNS of my domain (I manage my DNS configurations on my account on, here is the website link: https://www.godaddy.com/en-ie). I then started and connect to the instance. 

* **Step 1:** After connecting, I created a docker network by running this command:
```
docker network create wmap_network
```

* **Step 2:** I created a **dockerfile** using this command:
```
sudo nano Dockerfile
```
![Screenshot 2024-11-10 041444](https://github.com/user-attachments/assets/184186a6-7681-4839-851e-ca2ca13bf4ef)

* **Step 3:** I then pulled my images from my docker repository using this command:
```
docker pull ianhipolito659/geodjango_tutorial_image:latest
docker pull ianhipolito659/frontend_image:latest
```

* **Step 4:** After pulling the images, I created the four containers (**pgadmin**, **postgis**, **nginx**, **awm_django_app**, and **frontend_app**) essential for deploying my web application, I then started all the containers, here are the commands I used:
```
sudo docker create --name pgadmin4 --network wmap_network --network-alias pgadmin4 -t -v wmap_pgadmin_data:/var/lib/pgadmin -e 'PGADMIN_DEFAULT_EMAIL=c21436494@tudublin.ie' -e 'PGADMIN_DEFAULT_PASSWORD=password123' dpage/pgadmin4

sudo docker create --name postgis --network wmap_network --network-alias postgis -t -v postgis_data:/var/lib/postgresql -e 'POSTGRES_USER=docker' -e 'POSTGRES_PASS=docker' kartoza/postgis

sudo docker create --name nginx --network wmap_network --network-alias nginx -p 84:80 -p 443:443 -t -v wmap_web_data:/usr/share/nginx/html -v $HOME/nginx/conf:/etc/nginx/conf.d -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot nginx:latest

sudo docker create --name awm_django_app --network wmap_network --network-alias awm_django_app -t -v html_data:/usr/src/app/static ianhipolito659/geodjango_tutorial_image:latest

sudo docker create --name frontend_app --network wmap_network --network-alias frontend_app -p 3000:80 ianhipolito659/frontend_image:latest

docker start <container_id>
```

## Docker Containers Running on AWS:
![image](https://github.com/user-attachments/assets/2c0cdaaa-ac15-4a84-9c5a-d5720d779380)


* **Step 5:** I then used **Certbot** to get an SSL/TLS cert, this is a free, open source software tool for automatically using Let’s Encrypt certificates on manually-administrated websites to enable HTTPS, I did this by running these commands and entering the necessary information:
```
docker exec -it nginx /bin/bash

certbot certonly --nginx
```

* **Step 6:** I then configured my **Nginx Proxy** by going into my nginx/conf directory (in AWS) and creating two files called **headers.conf** (used to define HTTP headers that Nginx will add to responses) and **server.conf** (contains the main server block configuration for Nginx, it defines how Nginx handles incoming requests), I used these commands to create the files:
```
sudo nano headers.conf

sudo nano server.conf
```

## headers.conf File:
![Screenshot 2024-11-10 044851](https://github.com/user-attachments/assets/6c61f569-9aec-4704-a0cf-d4c6b6d99b15)

## server.conf File:
![image](https://github.com/user-attachments/assets/a6affcbc-aa5c-480a-8dd5-3fe2ecfc1717)
![image](https://github.com/user-attachments/assets/b450da4a-068e-43d4-831f-1efdb713a47b)

* **Step 7:** After all these steps, I restarted all the containers and tested out my project:
```
docker retart <container_id>
```

# App Functionality:
## Sign Up Page:
![image](https://github.com/user-attachments/assets/d51e31bf-4ba7-48d4-a3ed-f7a2add6f26b)

## Login Page:
![image](https://github.com/user-attachments/assets/42c20dfb-8eb2-4f09-904e-361d02f6b726)

## Map Page:
![image](https://github.com/user-attachments/assets/e86ea904-fe2d-4622-8189-38836c1f3d7a)

## Search Feature:
![image](https://github.com/user-attachments/assets/a759fa12-75f1-49b2-ae6f-f6f54eef478b)

## Popup Feature:
![image](https://github.com/user-attachments/assets/b9c37c62-41fc-476b-98cd-fb096ea3156a)

## Add and Remove Bookmark Feature:
![image](https://github.com/user-attachments/assets/2cbfa2fc-e90c-44e8-8aea-d83f5090f231)
![image](https://github.com/user-attachments/assets/36458eb4-d607-4c25-b7d7-caaa0d69f562)

## Get Route Feature:
![image](https://github.com/user-attachments/assets/bdbde284-a7cb-4161-905f-9a906bccd4b7)

## Subcategory Filter Feature:
![image](https://github.com/user-attachments/assets/8dc9bc20-e88a-4c85-a3ef-dffa0bb8cba9)
![image](https://github.com/user-attachments/assets/c36244e7-fec5-4a99-8850-53aa802d9d6f)

## Minimap Feature:
![image](https://github.com/user-attachments/assets/ec34d71c-f16e-4f2c-9880-d56a9e59e6d9)

## Find Closest Hospital Feature:
![image](https://github.com/user-attachments/assets/339974f6-01cd-4dcc-a4aa-79a438a16437)

## Logout Functionality (brings user back to login page)

## Django Admin Page Users (when a user signs up, they are stored in **Users** along with all the data and information they used to sign up with):
![image](https://github.com/user-attachments/assets/300d373f-6073-4147-bc11-0d0ef1b49c6d)

## Django Admin Page Hospital Spatial Data (where all the hospital data is stored, this is where I can create, modify and manpulate the hospital data):
![image](https://github.com/user-attachments/assets/55acc9d6-c517-4884-ab7e-9a35de21ea47)

## Django Admin Page Profiles With Current or Last Location:
![image](https://github.com/user-attachments/assets/90bc195b-9ad7-455d-bea3-717ae7ceebd6)

## Django Admin Page Location History of Users:
![image](https://github.com/user-attachments/assets/3d11cfd4-7105-48e6-bee7-9bbc022382cd)

# Conclusion
Advanced Web Mapping CA2: This project successfully implements a full-stack web application to search and interact with hospital data anywhere in Ireland. The web application combines Django, React, Typescript and PostgreSQL with up-to-date mapping technologies, covering important functionalities such as user authentication, geolocation services, and route finding. The containerisation of the project using Docker and its deployment on AWS make it production-ready. The solution effectively serves health providers and users securely and scalably.

