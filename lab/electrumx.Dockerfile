# Builds Atomicals ElectrumX from the exact revision the source manifest pins.
# No base image moves: python and system packages come from a bookworm snapshot.
FROM python:3.11.9-slim-bookworm

ARG ELECTRUMX_REVISION
RUN apt-get update \
    && apt-get install -y --no-install-recommends git build-essential liblibleveldb-dev libleveldb1d \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/atomicals/atomicals-electrumx /srv/electrumx \
    && git -C /srv/electrumx checkout "${ELECTRUMX_REVISION}"

RUN pip install --no-cache-dir -r /srv/electrumx/requirements.txt

WORKDIR /srv/electrumx
EXPOSE 51001
CMD ["python", "electrumx_server"]
