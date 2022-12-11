FROM node:17

# Install latest chrome dev package
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome* \
    && apt-get install -f \

# Run everything after as non-privileged user.
USER root

CMD cd /data/wechatbot/wechatbot \
    && yarn \
    && nohup node src/ & \
    && tail -f nohup.out \