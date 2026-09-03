# Builds Atomicals ElectrumX from the exact revision the source manifest pins.
# No base image moves: python and system packages come from a bookworm snapshot.
FROM python:3.11.9-slim-bookworm

ARG ELECTRUMX_REVISION
RUN apt-get update \
    && apt-get install -y --no-install-recommends git build-essential libleveldb-dev libleveldb1d \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/atomicals/atomicals-electrumx /srv/electrumx \
    && git -C /srv/electrumx checkout "${ELECTRUMX_REVISION}"

RUN pip install --no-cache-dir -r /srv/electrumx/requirements.txt

WORKDIR /srv/electrumx
# Unbuffered so the log survives a fast exit.
ENV PYTHONUNBUFFERED=1
# The server refuses to run as root; the data volume is owned by the same user.
RUN useradd --system --home /srv/electrumx --shell /usr/sbin/nologin electrumx && mkdir -p /data && chown electrumx:electrumx /data /srv/electrumx
USER electrumx
EXPOSE 51001
CMD ["python", "electrumx_server"]
