FROM eclipse-temurin:25-alpine
WORKDIR /workspace
COPY build/libs/knowledge-sharing-0.0.2-SNAPSHOT.jar app.jar
USER 10001:10001

ENV SERVER_PORT=9095
ENTRYPOINT ["java", "-jar", "/workspace/app.jar"]