## Task Router Microservices

### Quick start

Agent Service

```
cd agent-service
npm install
```

Task Service

```
cd ..
cd task-service
npm install
```

### To use Locally

Inside of both services folder run:
```
npm run start-dev
```

### To use it in Docker

- Install Docker for Windows or Mac

Build Images and containers
```
docker-compose -f "docker-compose.yml" up -d --build
```

Startup Replica
```
docker-compose up setup-rs mongo-rs1-1 mongo-rs1-2 mongo-rs1-3
```

Startup Services
```
docker-compose up task-service agent-service
```

Stop all
```
docker-compose down
```