---
slug: custom-aur
name: Custom AUR
summary: Repositorio personal de recetas PKGBUILD para Arch Linux y CachyOS, actualizado a diario con GitHub Actions y nvchecker.
technologies:
  - PKGBUILD
  - Arch Linux
  - GitHub Actions
  - nvchecker
  - Python
  - Shell
repositoryUrl: https://github.com/dcerezotorrejon/custom-AUR
archived: true
order: 4
seo:
  title: Custom AUR | Daniel Cerezo Torrejón | Portfolio profesional
  description: Repositorio personal de recetas PKGBUILD para Arch Linux y CachyOS, actualizado con GitHub Actions y nvchecker.
---

Es un repositorio personal de recetas `PKGBUILD` para Arch Linux y CachyOS. Las mantiene al día frente a las versiones de origen y permite usarlas desde el sistema local con Paru 2.0 o superior, sin servidores RPC ni intermediarios.

Un flujo diario de GitHub Actions consulta las versiones publicadas con nvchecker, actualiza `pkgver` y recalcula las sumas de verificación con `updpkgsums`. Después regenera los metadatos `.SRCINFO` con `makepkg` y, si hay cambios, los sube a la rama principal.

Incluye las recetas de Google Chrome y de Visual Studio Code. El proyecto está archivado y no declara ninguna licencia.
