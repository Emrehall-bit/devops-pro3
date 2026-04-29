FROM eclipse-temurin:25-jre

WORKDIR /app

RUN useradd --system --create-home --home-dir /app spring

COPY target/*.jar app.jar

RUN chown spring:spring /app/app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
