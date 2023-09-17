# Two factor authentication using speakeasy

## Intro
One of the ways through which 2FA is implemented is using the speakeasy library.

The Speakeasy library provides two-factor authentication using a One-Time Password (OTP). The library provides an additional layer of security to an application’s standard authentication process.

## Application
This is an NodeJS - Express app which is server on port 5000 it persists it's users and tokens in a node-json-db database. 

The applications uses 3 endpoint: 
1. [POST] /api/register for registering users
2. [POST] /api/verify for verifying a new registered user (and storing it as an active user)
3. [POST] /api/validate for validating a user

## Resources
based on a section.io article - [source](https:/api//www.section.io/engineering-education/speakeasy-two-factor-authentication-in-nodejs/)  
Speakeasy repo - [github](https://github.com/speakeasyjs/speakeasy)
