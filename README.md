# Advanced Web Mapping CA 1:
In this readme I will discuss and break down of my advanced web mapping CA 1 project.

* Link to site: https://c21436494.xyz/hospital/login/
* Link to docker repository: https://hub.docker.com/repository/docker/ianhipolito659/geodjango_tutorial_image/general

# Features (Will be discussed in further detail in the readme):
* **User Authentication:** Signup, login, and logout functionality.
* **Geolocation:** Users can update their location and view nearby hospitals.
* **Hospital Data:** Displays hospitals from a GeoJSON file with details like name, address, and category.
* **Interactive Map:** Utilises Leaflet for map rendering with markers for hospitals and user location.
* **Creating, Manipulating and Storing Spatial Data:** I am able to create, manipulate, and store data in my django admin page.

Please sign up to create an account and login, this will bring you to "/hospital/map/" where you will be able to see where all the hospitals in Ireland are located.

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

### dockerfile:
![Screenshot 2024-11-09 214322](https://github.com/user-attachments/assets/3e295b7d-8681-4271-a219-ca220ab06c56)

This file provides the instructions to build a Docker image for the Django application. It specifies the base image, installs necessary dependencies, copies application files, and defines commands to run the app. The Dockerfile ensures a consistent environment for the Django application, including specific libraries and configurations for deployment.

### docker-compose.yml File:
![Screenshot 2024-11-09 215224](https://github.com/user-attachments/assets/46362d49-ab45-47b2-ae8e-0bc5bab6b660)

This file defines the services, networks, and volumes needed to run the application in a Docker environment. It includes configurations for services like **nginx**, **pgadmin4**, **postgis**, and the **Django application**. Each service has specific settings such as ports, environment variables, and dependencies, which coordinate the entire application stack.

These files together facilitate setting up and running the application within a Docker environment, enabling easy deployment and consistent behavior across different systems.

I also created a file called **default.conf** which  contains the Nginx configuration for routing and handling HTTP requests for my application.

### default.conf File:
![Screenshot 2024-11-09 215705](https://github.com/user-attachments/assets/0a61f638-6297-4880-b7f8-c11ec1e8f6cf)

This configuration ensures that Nginx correctly serves your Django application and static assets, handling incoming requests efficiently.

I also created an **ENV.yml** file by running this command (made some modifications in the file):
```
conda env export --from-hisory > ENV.yml
```

### ENV.yml File:
![Screenshot 2024-11-10 043252](https://github.com/user-attachments/assets/477f34c0-d910-4a7c-b5d9-6e93f75821a6)

I used the following command to build the image for my project:
```
docker build -t geodjango_tutorial_image .
```
I used the following command to compose up and create all the containers defined in the docker-compose.yml file:
```
docker-compose up
```

### Image of Containers and Images Used From Docker Desktop:
![Screenshot 2024-11-09 220230](https://github.com/user-attachments/assets/aa680dbd-900d-42f2-9a40-7f2da5c45ee7)

## Steps For Deployment Setup After Local Setup:
After coding and creating all the app's functionality (app functionality will be discussed further down in the readme), and testing that everything is running and working smoothly on my localhost, I started the deployment process. I first created a docker repository to store my app's image (linked above), so that I could push and pull the latest image.

I started by rebuilding the image by using this command:
```
docker build -t ianhipolito659/geodjango_tutorial_image:latest .
```
Then I pushed the built the image onto the docker repository by using this command:
```
docker push ianhipolito659/geodjango_tutorial_image:latest
```
After pushing the latest version of the image to the docker repository, I created an instance using AWS cloud services and connected to it.

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

* **Step 3:** I then pulled my django app image from my docker repository using this command:
```
docker pull ianhipolito659/geodjango_tutorial_image:latest
```

* **Step 4:** After pulling the image, I created the four containers (**pgadmin**, **postgis**, **nginx**, and **awm_django_app**) essential for deploying my web application, I then started all the containers, here are the commands I used:
```
sudo docker create --name pgadmin4 --network wmap_network --network-alias pgadmin4 -t -v wmap_pgadmin_data:/var/lib/pgadmin -e 'PGADMIN_DEFAULT_EMAIL=c21436494@tudublin.ie' -e 'PGADMIN_DEFAULT_PASSWORD=password123' dpage/pgadmin4

sudo docker create --name postgis --network wmap_network --network-alias postgis -t -v postgis_data:/var/lib/postgresql -e 'POSTGRES_USER=docker' -e 'POSTGRES_PASS=docker' kartoza/postgis

sudo docker create --name nginx --network wmap_network --network-alias nginx -p 84:80 -p 443:443 -t -v wmap_web_data:/usr/share/nginx/html -v $HOME/nginx/conf:/etc/nginx/conf.d -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot nginx:latest

sudo docker create --name awm_django_app --network wmap_network --network-alias awm_django_app -t -v html_data:/usr/src/app/static ianhipolito659/geodjango_tutorial_image:latest

docker start <container_id>
```

## Docker Containers Running on AWS:
![Screenshot 2024-11-10 044154](https://github.com/user-attachments/assets/dd4e9ba9-899e-4041-81a0-fb1a261f21a6)


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
![Screenshot 2024-11-10 044910](https://github.com/user-attachments/assets/fac320ba-d92f-4c9c-8a69-4b5589e945ea)

* **Step 7:** After all these steps, I restarted all the containers and tested out my project:
```
docker retart <container_id>
```

# App Functionality:
## Sign Up Page:
![Screenshot 2024-11-10 045731](https://github.com/user-attachments/assets/be18238e-d3b8-426a-83b2-4e63f1f36eb6)

## Login Page:
![Screenshot 2024-11-10 045647](https://github.com/user-attachments/assets/35ec2a1b-2da8-41f1-8d41-f63f21bc35d4)

## Map Page:
![Screenshot 2024-11-10 045831](https://github.com/user-attachments/assets/a7614db2-72c2-4fba-a029-892bf64c0b79)

## Map Page Verifying That User Location Has Been Updated:
![Screenshot 2024-11-10 050050](https://github.com/user-attachments/assets/8dfbe2fc-e193-4d46-84b3-eefb932be76d)

## Map Page With Pin Markers, Marking All The Hospitals In Ireland:
![Screenshot 2024-11-10 050334](https://github.com/user-attachments/assets/5429ca51-c7d5-4097-9af1-4615d145fcd7)

## Map Page Hospital Marker Details:
![Screenshot 2024-11-10 050402](https://github.com/user-attachments/assets/56352ea7-ae82-47b1-ba40-99801273ff90)

## Map Page Search Function (only shows searched hospital pin marker results):
![Screenshot 2024-11-10 050520](https://github.com/user-attachments/assets/9c8e94f3-dec6-40a2-bf91-09e65cfd7435)

## Map Page Minimap:
![Screenshot 2024-11-10 050420](https://github.com/user-attachments/assets/67a0c452-71ee-4261-b5b9-3ff6a3ca8c05)

## Logout Functionality (brings user back to login page)

## Django Admin Page:
![Screenshot 2024-11-10 050754](https://github.com/user-attachments/assets/f316a09b-2989-4cca-a97f-0624376877fa)

## Django Admin Page Users (when a user signs up, they are stored in **Users** along with all the data and information they used to sign up with):
![Screenshot 2024-11-10 050829](https://github.com/user-attachments/assets/6219f229-8e40-4322-a761-5c46d092a274)

## Django Admin Page Hospital Spatial Data (where all the hospital data is stored, this is where I can create, modify and manpulate the hospital data):
![Screenshot 2024-11-10 051230](https://github.com/user-attachments/assets/0ebac155-5e65-41a6-9e2c-9e83c922137a)

# Conclusion
In conclusion, this Advanced Web Mapping project successfully demonstrates a robust integration of Django with spatial data management and Docker-based deployment, enabling users to interact with geographic data through a dynamic application. By incorporating user authentication, geolocation features, and interactive maps powered by Leaflet, the project provides a solution for locating hospitals across Ireland. The app's user experience is supported by Docker and AWS, ensuring a stable and scalable deployment process. 
