---
slug: openrazer
name: OpenRazer Device Config
summary: Script en Python que personaliza la iluminación de dispositivos Razer en Linux mediante OpenRazer y un archivo JSON.
technologies:
  - Python
  - OpenRazer
  - D-Bus
  - JSON
repositoryUrl: https://github.com/dcerezotorrejon/LinuxOpenRazerDeviceConfig
archived: false
license: GPL-3.0
order: 2
seo:
  title: OpenRazer Device Config | Daniel Cerezo Torrejón | Portfolio profesional
  description: Script en Python para personalizar la iluminación de teclados y ratones Razer en Linux con OpenRazer.
---

Es una herramienta para configurar la iluminación de dispositivos Razer en Linux usando OpenRazer. Detecta automáticamente los teclados y ratones compatibles y aplica la configuración definida en un archivo JSON.

Permite ajustar el brillo por tipo de dispositivo y asignar un color a cada tecla mediante una matriz de coordenadas. Si un dispositivo no expone matriz de LEDs, usa un color estático.

El script consulta los dispositivos de forma periódica, atiende las señales del sistema y reaplica la configuración tras reanudar el equipo, escuchando los eventos de suspensión a través de D-Bus. Su arquitectura se organiza en clases y componentes con una responsabilidad concreta, como la detección de dispositivos, el registro de los ya configurados y la gestión de efectos.

El README documenta limitaciones conocidas: algunos modelos de ratón exponen las zonas de LED de forma distinta según el firmware o el controlador.
