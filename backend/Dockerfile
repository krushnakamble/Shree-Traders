# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the pom.xml and resolve dependencies
COPY pom.xml .
# Copy the source code
COPY src ./src
# Build the application skipping tests to speed up the process
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy the compiled jar from the build stage
COPY --from=build /app/target/*.jar app.jar
# Expose the standard backend port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
