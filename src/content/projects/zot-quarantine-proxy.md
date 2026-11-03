---
slug: zot-quarantine-proxy
name: Zot Quarantine Proxy
summary: Caché de imágenes de contenedores para homelab, basada en Podman y Zot, que escanea con ClamAV y retiene las actualizaciones de imágenes ya verificadas.
technologies:
  - Python
  - Podman
  - Zot
  - Trivy
  - ClamAV
repositoryUrl: https://github.com/dcerezotorrejon/zot-quarantine-proxy
archived: true
order: 5
seo:
  title: Zot Quarantine Proxy | Daniel Cerezo Torrejón | Portfolio profesional
  description: Caché de imágenes de contenedores para homelab, con Podman y Zot, que escanea con ClamAV y retiene las actualizaciones de imágenes ya verificadas.
---

Es una caché de imágenes de contenedores (pull-through) pensada para un homelab, basada en Podman y Zot. Se ejecuta como un pod de Podman con tres contenedores: Zot como almacén OCI, un proxy en Python que atiende las peticiones de los clientes y un actualizador, también en Python.

Cuando se pide una imagen nueva, el proxy la sirve desde el registro público, la copia en segundo plano y la escanea con ClamAV. Si está limpia, la promueve de inmediato al espacio de imágenes verificadas, sin comprobar CVE ni esperar ningún plazo.

Las actualizaciones siguen un camino más largo. El actualizador revisa cada seis horas si un tag ya verificado apunta a un digest distinto y, por defecto, espera siete días desde la fecha de construcción de la imagen en el origen (`QUARANTINE_DAYS`). Antes de promoverla la analiza con ClamAV y, de forma opcional, con Trivy. Los CVE solo bloquean la promoción si se define `CVE_SEVERITY_THRESHOLD`, que por defecto está vacío.

El proyecto está archivado y no declara ninguna licencia.
