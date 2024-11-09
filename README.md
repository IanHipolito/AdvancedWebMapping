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
After creating the project app, installed all the necessary libraries, and configured my settings.py correctly, I created a **dockerfile** and a **docker-compose.yml** file. The dockerfile is a script reponsible for giving instructions on building a docker image. The docker-compose.yml is used to define and run multi-container applications such as my django web application.

### Docker File:
![Screenshot 2024-11-09 214322](https://github.com/user-attachments/assets/3e295b7d-8681-4271-a219-ca220ab06c56)

This file provides the instructions to build a Docker image for the Django application. It specifies the base image, installs necessary dependencies, copies application files, and defines commands to run the app. The Dockerfile ensures a consistent environment for the Django application, including specific libraries and configurations for deployment.

### Docker-Compose.yml File:
![Screenshot 2024-11-09 215224](https://github.com/user-attachments/assets/46362d49-ab45-47b2-ae8e-0bc5bab6b660)

This file defines the services, networks, and volumes needed to run the application in a Docker environment. It includes configurations for services like ***nginx***, ***pgadmin4***, ***postgis***, and the ***Django application***. Each service has specific settings such as ports, environment variables, and dependencies, which coordinate the entire application stack.

These files together facilitate setting up and running the application within a Docker environment, enabling easy deployment and consistent behavior across different systems.

I also created a file called ***default.conf** which  contains the Nginx configuration for routing and handling HTTP requests for my application.

### Default.conf File:
![Screenshot 2024-11-09 215705](https://github.com/user-attachments/assets/0a61f638-6297-4880-b7f8-c11ec1e8f6cf)

This configuration ensures that Nginx correctly serves your Django application and static assets, handling incoming requests efficiently.

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
