FROM mongo

# Create app directory
WORKDIR /usr/src/configs

# Install dependencies
COPY replicaSet.js .
COPY setup.sh .

CMD ["./setup.sh"]