---
slug: hassio-pacman
name: Hassio Pacman Cherry
summary: Complemento de Home Assistant basado en Arch Linux que compila recetas PKGBUILD de un repositorio Git y las sirve como repositorio de Pacman.
technologies:
  - Shell
  - Docker
  - Arch Linux
  - Pacman
  - Caddy
  - Home Assistant
repositoryUrl: https://github.com/dcerezotorrejon/Hassio-pacman-cherry
archived: true
image:
  src: ./hassio-pacman-icon.svg
  alt: "Icono del proyecto: Pac-Man sobre una pantalla oscura de estilo tubo catódico, de cara al logotipo de Arch Linux, que está frente a su boca abierta"
order: 3
seo:
  title: Hassio Pacman Cherry | Daniel Cerezo Torrejón | Portfolio profesional
  description: Complemento de Home Assistant sobre Arch Linux que compila recetas PKGBUILD y las sirve como repositorio de Pacman.
---

Es un complemento de Home Assistant basado en Arch Linux que actúa como repositorio personalizado de Pacman. Automatiza la compilación de recetas `PKGBUILD` alojadas en un repositorio Git, como el de custom-AUR, y las sirve mediante un servidor web Caddy.

Clona el repositorio de recetas y lo vigila: si detecta commits nuevos, o en el primer arranque, compila los paquetes nuevos o actualizados bajo un usuario sin privilegios. Después actualiza la base de datos del repositorio con `repo-add`, y comprueba si hay cambios cada cierto intervalo configurable.

Además del complemento, el README describe cómo ejecutarlo como contenedor Docker independiente, con Docker Compose, Portainer o `docker run`.

El proyecto está archivado y no declara ninguna licencia.
