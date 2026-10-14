# STASH: Aplicación móvil multiplataforma para la administración de finanzas personales

## Descripción del proyecto

STASH es una aplicación móvil multiplataforma orientada a la administración de finanzas personales. Será desarrollada mediante **React Native y Expo**, permitiendo utilizar una misma base de código para dispositivos **Android e iOS**.

La aplicación permitirá al usuario registrar y consultar información financiera personal como cuentas, ingresos, gastos, categorías y presupuestos. Los datos capturados serán procesados para actualizar automáticamente los saldos de las cuentas y generar información resumida para su consulta.

Desde el punto de vista técnico, STASH seguirá una arquitectura cliente-servidor. 

La aplicación no realizará operaciones bancarias reales ni establecerá conexión automática con instituciones financieras. El registro de movimientos será realizado manualmente por el usuario.

## Objetivo general

Desarrollar una aplicación móvil multiplataforma para dispositivos Android e iOS mediante React Native, que permita administrar información financiera personal a través del registro y procesamiento de ingresos, gastos, cuentas y presupuestos, implementando una arquitectura organizada, persistencia de datos y control de versiones colaborativo.

## Objetivos especificos 

-Diseñar la arquitectura cliente-servidor de la aplicación móvil, definiendo la estructura de sus componentes, la organización del código y la comunicación entre la interfaz desarrollada con React Native y los servicios del servidor implementados con Node.js y Express.js.

-Implementar un sistema de gestión de usuarios y cuentas personales que permita el registro, almacenamiento y consulta de información mediante una base de datos SQLite, garantizando la persistencia y organización de los datos financieros.

-Programar los módulos de administración financiera para el registro de los ingresos y gastos, la clasificación de movimientos por categorías, la gestión de presupuestos y la actualización automáticamente los saldos de las cuentas y el balance general.

-Integrar las funcionalidades de la aplicación en un entorno multiplataforma mediante React Native y Expo, realizando pruebas de funcionamiento en Android e iOS.


## Principales funcionalidades

Las principales funcionalidades contempladas para STASH son:

- Registro e inicio de sesión de usuarios.
- Gestión de cuentas personales, como efectivo, débito, crédito y ahorro.
- Registro de ingresos y gastos.
- Clasificación de movimientos mediante categorías.
- Actualización automática del saldo de cada cuenta y del balance general.
- Consulta del historial de movimientos.
- Gestión básica de presupuestos.
- Visualización de reportes y distribución de gastos por categoría.


## Tecnologías propuestas

Para el desarrollo del proyecto se contempla el uso de:

- React Native.
- JavaScript.
- Node.js.
- Express.js.
- SQLite.
- Git.
- GitHub.

React Native y Expo permiten desarrollar la aplicación para Android e iOS utilizando una misma base de código. Git y GitHub se utilizarán para el control de versiones y la colaboración entre los integrantes del equipo mediante ramas, commits y pull requests.

## Requisitos previos

Antes de comenzar a trabajar con el proyecto se recomienda contar con:

- Git instalado en el equipo.
- Una cuenta de GitHub.
- Visual Studio Code.
- Node.js.
- npm.
- Android Studio para el emulador de Android.
- Expo para ejecutar y probar la aplicación durante el desarrollo.

## Control de versiones

El proyecto utiliza **Git y GitHub** para administrar los cambios realizados en el código fuente.

Cada integrante del equipo podrá trabajar en ramas independientes y posteriormente integrar sus cambios mediante **Pull Requests**, permitiendo revisar las modificaciones antes de incorporarlas a la versión principal del proyecto.


## Arquitectura del sistema


### 1. Cliente móvil

La interfaz de usuario será desarrollada con **React Native y Expo**.

Esta capa será responsable de:

- Mostrar las diferentes pantallas de la aplicación.
- Capturar la información ingresada por el usuario.
- Gestionar la navegación entre pantallas.
- Validar datos básicos antes de enviarlos al servidor.
- Consumir los servicios proporcionados por la API REST.
- Mostrar saldos, movimientos, cuentas y reportes.

La misma base de código será utilizada para generar la aplicación en Android e iOS.



## Desarrollo multiplataforma

STASH está diseñada para funcionar en los sistemas operativos móviles **Android e iOS**.

Para evitar desarrollar dos aplicaciones independientes, se utilizará **React Native**, framework que permite construir interfaces móviles nativas utilizando JavaScript.

Con React Native, la mayor parte del código será compartido entre ambas plataformas:

```text
               Código fuente STASH
                       |
                React Native + Expo
                  /             \
             Android            iOS
