FROM mongo

# Create app directory
WORKDIR /usr/src/configs

# Install dependencies
COPY replicaSet.js .
COPY setup.sh .

ENTRYPOINT ["sh", "./setup.sh"]
# RUN ["chmod", "+x", "./setup.sh"]