FROM eclipse-temurin:17-jre
ENV MEMORY_ALLOCATION=1024

WORKDIR /server

ENTRYPOINT [ "java", "-Xms", "${MEMORY_ALLOCATION}", "-Xmx", "${MEMORY_ALLOCATION}", "-jar", "/server/server.jar" ]